import { createHmac, timingSafeEqual } from "node:crypto";

/*
  Signed links, no table.

  A confirmation or unsubscribe link has to survive being clicked days later,
  from a mail client, with no session. The usual answer is a row in a database
  keyed by a random token — but the storefront has no database of its own, and
  adding one so that people can unsubscribe would be the wrong order to build
  things in.

  So the link carries its own payload, signed with a server-only secret. It is
  unforgeable, it needs no lookup, and an unsubscribe link keeps working
  forever, which is exactly what the law expects of it.
*/

export type TokenPurpose = "opt-in" | "unsubscribe" | "preferences" | "verify-account";

interface TokenPayload {
  /** Purpose — an opt-in link must not double as an unsubscribe link. */
  p: TokenPurpose;
  /** Email address, lowercased. */
  e: string;
  /** Subject the link acts on, when it is not the address itself (a user id). */
  s?: string;
  /** Expiry, unix seconds. Absent means it never expires. */
  x?: number;
}

const OPT_IN_TTL_SECONDS = 7 * 24 * 60 * 60;
/** Expiring purposes and their lifetimes; anything absent never expires. */
const TTL_SECONDS: Partial<Record<TokenPurpose, number>> = {
  "opt-in": OPT_IN_TTL_SECONDS,
  "verify-account": OPT_IN_TTL_SECONDS,
};

function secret(): string {
  const value = process.env.EMAIL_TOKEN_SECRET ?? "";
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    // Signing with a known constant in production would let anyone unsubscribe
    // — or opt in — any address they can spell.
    throw new Error("EMAIL_TOKEN_SECRET must be set in production");
  }
  return "dev-only-email-token-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return b64url(createHmac("sha256", secret()).update(body).digest());
}

export function signToken(purpose: TokenPurpose, email: string, subject?: string): string {
  const payload: TokenPayload = { p: purpose, e: email.trim().toLowerCase() };
  if (subject) payload.s = subject;
  // Only confirmation links expire: an unconfirmed address should not stay
  // confirmable for a year, while an unsubscribe link that stops working is a
  // complaint waiting to happen.
  const ttl = TTL_SECONDS[purpose];
  if (ttl) payload.x = Math.floor(Date.now() / 1000) + ttl;
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export interface VerifiedToken {
  email: string;
  purpose: TokenPurpose;
  subject?: string;
}

export function verifyToken(token: string | null | undefined, purpose: TokenPurpose): VerifiedToken | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }

  if (payload.p !== purpose) return null;
  if (payload.x && payload.x < Math.floor(Date.now() / 1000)) return null;
  if (!payload.e) return null;

  return { email: payload.e, purpose: payload.p, subject: payload.s };
}
