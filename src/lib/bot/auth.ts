import { createHash, timingSafeEqual } from "node:crypto";

/** Shortest BOT_API_KEY accepted — the key is the only thing guarding customer data. */
export const MIN_BOT_KEY_LENGTH = 32;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * Whether a request comes from the club bot: `Authorization: Bearer <BOT_API_KEY>`.
 * Without a long enough key configured, nobody is.
 */
export function isBotCaller(authorization: string | null, key = process.env.BOT_API_KEY): boolean {
  if (!key || key.length < MIN_BOT_KEY_LENGTH || !authorization?.startsWith("Bearer ")) return false;
  // Hashing first gives equal lengths, so the comparison is constant-time.
  return timingSafeEqual(digest(authorization.slice(7)), digest(key));
}
