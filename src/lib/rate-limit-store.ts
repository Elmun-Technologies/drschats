import "server-only";

import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { clearRateLimit, rateLimitSpent, withinRateLimit, type RateLimit } from "@/lib/rate-limit";

/*
  Rate limits that hold across machines and deploys (0020 rate_limit_hits),
  for the forms where that matters: checkout, admin sign-in, opt-in, restock
  SMS. The in-memory counter (lib/rate-limit.ts) reset on every deploy and
  counted per machine, so a script could simply wait for the next release.

  One upsert per check. When the database is missing or slow the memory
  counter answers instead: a blinking database must never take checkout
  down with it.

  The stored key is an HMAC of the raw key — an IP or a phone never sits in
  this table in clear.
*/

const TIMEOUT_MS = 1500;

function salt(): string {
  return process.env.RATE_LIMIT_SALT?.trim() || process.env.ADMIN_SESSION_SECRET?.trim() || "govita-rate-limit";
}

export function storedKey(scope: string, key: string, secret = salt()): string {
  return createHmac("sha256", secret).update(`govita:rl:v1:${scope}:${key}`).digest("base64url").slice(0, 32);
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("rate limit store timeout")), TIMEOUT_MS))]);
}

let warned = false;
function fallback(err: unknown) {
  if (!warned) {
    warned = true;
    console.error("[rate-limit] database counter unavailable, using memory:", (err as Error).message);
  }
}

/** Count one attempt; false once this window's budget is spent. */
export async function hitRateLimit(scope: string, key: string, limit: RateLimit): Promise<boolean> {
  if (!isDbConfigured) return withinRateLimit(scope, key, limit);
  try {
    const rows = (await withTimeout(
      getDb().execute(sql`
        insert into rate_limit_hits (scope, key, count, reset_at)
        values (${scope}, ${storedKey(scope, key)}, 1, now() + (${limit.windowMs}::int * interval '1 millisecond'))
        on conflict (scope, key) do update set
          count = case when rate_limit_hits.reset_at <= now() then 1 else rate_limit_hits.count + 1 end,
          reset_at = case when rate_limit_hits.reset_at <= now() then excluded.reset_at else rate_limit_hits.reset_at end
        returning count`),
    )) as unknown as { count: number }[];
    return Number(rows[0]?.count ?? 1) <= limit.limit;
  } catch (err) {
    fallback(err);
    return withinRateLimit(scope, key, limit);
  }
}

/** Whether the budget is already spent, without counting an attempt. */
export async function rateLimitReached(scope: string, key: string, limit: RateLimit): Promise<boolean> {
  if (!isDbConfigured) return rateLimitSpent(scope, key, limit);
  try {
    const rows = (await withTimeout(
      getDb().execute(sql`
        select count from rate_limit_hits
        where scope = ${scope} and key = ${storedKey(scope, key)} and reset_at > now()`),
    )) as unknown as { count: number }[];
    return Number(rows[0]?.count ?? 0) >= limit.limit;
  } catch (err) {
    fallback(err);
    return rateLimitSpent(scope, key, limit);
  }
}

/** Forget a key's count (a successful sign-in clears its failures). */
export async function resetRateLimit(scope: string, key: string): Promise<void> {
  clearRateLimit(scope, key);
  if (!isDbConfigured) return;
  try {
    await withTimeout(getDb().execute(sql`delete from rate_limit_hits where scope = ${scope} and key = ${storedKey(scope, key)}`));
  } catch (err) {
    fallback(err);
  }
}

/** Expired rows, for the retention sweep. */
export async function pruneRateLimits(): Promise<number> {
  const rows = (await getDb().execute(sql`delete from rate_limit_hits where reset_at < now() - interval '1 hour' returning 1`)) as unknown as unknown[];
  return rows.length;
}
