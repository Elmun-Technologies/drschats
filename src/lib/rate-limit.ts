/*
  A per-IP counter held in memory.

  Deliberately not a shared store. On Vercel each instance keeps its own map,
  so the real limit is (instances × limit) — which is fine for what this
  defends against: a script hammering a public form from one address. Anything
  determined enough to spread across instances needs the edge to stop it, not a
  Map, and pulling in Redis to pretend otherwise would add a dependency that
  can fail and take checkout down with it.

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

/** Number of keys currently held for a scope — exposed for tests. */
export function bucketCount(name: string): number {
  return buckets.get(name)?.size ?? 0;
}

/**
 * Best-effort client address. The first X-Forwarded-For entry is whatever the
 * client sent, so it is never trusted: the edge's own header wins, and failing
 * that the entry appended by the nearest proxy (the last one).
 */
export function clientIp(headers: Headers): string {
  const direct = headers.get("fly-client-ip")?.trim() || headers.get("x-real-ip")?.trim();
  if (direct) return direct;
  const forwarded = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}
