import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time string comparison: hashing first gives equal lengths. */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

/**
 * Whether `given` matches a configured secret. An unset or empty secret
 * matches nothing, so a missing env var leaves the route shut, not open.
 */
export function matchesSecret(given: unknown, secret: string | undefined): boolean {
  if (!secret || typeof given !== "string") return false;
  return safeEqual(given, secret);
}
