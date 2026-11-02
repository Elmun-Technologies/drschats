/*
  A per-IP counter held in memory.

  Each machine keeps its own map and a deploy empties it, so the real limit is
  (machines × limit) per release — fine for cheap endpoints (the journey
  beacon, previews). Forms where a restart must not reset the budget —
  checkout, admin sign-in, opt-in, restock SMS — use the Postgres counter in
  lib/rate-limit-store.ts, which falls back to this one when the database is
  down, so a database blink never takes checkout with it.

  Buckets are swept lazily; a request that finds an expired bucket replaces it,
  and once a scope grows past SWEEP_THRESHOLD every expired bucket is dropped,
  so addresses that never come back cannot grow the map without bound.
*/

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Map<string, Bucket>>();

export const SWEEP_THRESHOLD = 1000;

function sweep(scope: Map<string, Bucket>, now: number): void {
  for (const [key, bucket] of scope) {
    if (now > bucket.resetAt) scope.delete(key);
  }
}

export interface RateLimit {
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
}

/** Whether this window's budget is already spent, without counting an attempt. */
export function rateLimitSpent(name: string, key: string, { limit }: RateLimit): boolean {
  const bucket = buckets.get(name)?.get(key);
  return Boolean(bucket && Date.now() <= bucket.resetAt && bucket.count >= limit);
}

/**
 * Count one attempt. Returns false once the limit for this window is spent.
 *
 * `name` scopes the counter, so the newsletter form and checkout do not share
 * a budget and one cannot lock the other out.
 */
export function withinRateLimit(name: string, key: string, { limit, windowMs }: RateLimit): boolean {
  const now = Date.now();
  let scope = buckets.get(name);
  if (!scope) {
    scope = new Map();
    buckets.set(name, scope);
  }

  const bucket = scope.get(key);
  if (!bucket || now > bucket.resetAt) {
    if (!bucket && scope.size >= SWEEP_THRESHOLD) sweep(scope, now);
    scope.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clearRateLimit(name: string, key: string): void {
  buckets.get(name)?.delete(key);
}

/** Number of keys currently held for a scope — exposed for tests. */
export function bucketCount(name: string): number {
  return buckets.get(name)?.size ?? 0;
}

/**
 * Best-effort client address. The first X-Forwarded-For entry is whatever the
 * client sent, so it is never trusted: the edge's own header wins, and failing
 * that the entry appended by the nearest proxy (the last one).
 *
 * An edge header is trusted only on the platform that writes it. Fly's proxy
 * sets Fly-Client-IP; anywhere else (Vercel, a plain server) that header is
 * just text the client chose, and trusting it let every request pick a fresh
 * address and walk past every limit.
 */
export function clientIp(headers: Headers, platform: Platform = currentPlatform()): string {
  const edge =
    platform === "fly" ? headers.get("fly-client-ip") : platform === "vercel" ? headers.get("x-real-ip") : null;
  const direct = edge?.trim();
  if (direct) return direct;
  const forwarded = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}

export type Platform = "fly" | "vercel" | "other";

function currentPlatform(): Platform {
  if (process.env.FLY_APP_NAME) return "fly";
  if (process.env.VERCEL) return "vercel";
  return "other";
}
