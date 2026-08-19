/*
  A per-IP counter held in memory.

  Deliberately not a shared store. On Vercel each instance keeps its own map,
  so the real limit is (instances × limit) — which is fine for what this
  defends against: a script hammering a public form from one address. Anything
  determined enough to spread across instances needs the edge to stop it, not a
  Map, and pulling in Redis to pretend otherwise would add a dependency that
  can fail and take checkout down with it.

  Buckets are swept lazily; a request that finds an expired bucket replaces it.
*/

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Map<string, Bucket>>();

export interface RateLimit {
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
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
    scope.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Best-effort client address; "unknown" buckets everything behind a proxy together. */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
