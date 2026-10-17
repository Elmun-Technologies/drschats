import { createHmac, timingSafeEqual } from "node:crypto";

/*
  Proof of phone ownership before points are spent — the crypto half, pure
  (the secret and the clock are arguments, so it is testable).

  Anyone can type someone else's number into the cart, so spending points
  needs a code sent to that number. The code is 6 digits, lives 5 minutes,
  allows 5 attempts, and only its HMAC is stored — keyed with a server secret
  and bound to the phone, so a leaked table row is useless and a code for one
  number cannot be replayed for another.

  A correct code buys a redemption token: HMAC-signed, bound to the phone and
  a points cap (the balance at that moment), 30 minutes. The order
  transaction re-verifies it and re-reads the balance under the phone lock;
  the token only says "this browser proved this phone".
*/

export const OTP_TTL_MS = 5 * 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 6;
export const TOKEN_TTL_MS = 30 * 60_000;

/** `randomInt(n)` → integer in [0, n); the server passes crypto.randomInt. */
export function generateOtp(randomInt: (n: number) => number): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) code += String(randomInt(10));
  return code;
}

export function hashOtp(phone9: string, code: string, secret: string): string {
  return createHmac("sha256", secret).update(`govita:loyalty-otp:v1:${phone9}:${code}`).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export interface OtpRow {
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
}

export type OtpVerdict = "ok" | "wrong" | "expired" | "locked" | "used";

/**
 * Checks a typed code against the latest row. "wrong" means the caller must
 * count the attempt; the attempt that reaches the limit is still checked
 * (5 tries, not 4), every later one is "locked" without comparing.
 */
export function checkOtp(row: OtpRow, phone9: string, typed: string, secret: string, now: Date): OtpVerdict {
  if (row.consumedAt) return "used";
  if (row.expiresAt.getTime() <= now.getTime()) return "expired";
  if (row.attempts >= OTP_MAX_ATTEMPTS) return "locked";
  const clean = typed.replace(/\D/g, "");
  if (clean.length !== OTP_LENGTH) return "wrong";
  return equal(hashOtp(phone9, clean, secret), row.codeHash) ? "ok" : "wrong";
}

export interface RedeemToken {
  /** The phone's last nine digits. */
  p: string;
  /** Points cap: the balance when the code was verified. */
  c: number;
  /** Expiry, epoch ms. */
  e: number;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(`govita:loyalty-token:v1:${body}`).digest("base64url").slice(0, 32);
}

export function signRedeemToken(token: RedeemToken, secret: string): string {
  const body = Buffer.from(JSON.stringify(token)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifyRedeemToken(raw: string | null | undefined, secret: string, now: Date): RedeemToken | null {
  if (!raw || raw.length > 400) return null;
  const [body, sig, extra] = raw.split(".");
  if (!body || !sig || extra !== undefined) return null;
  if (!equal(sign(body, secret), sig)) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as RedeemToken;
    if (typeof t.p !== "string" || !/^[0-9]{9}$/.test(t.p)) return null;
    if (!Number.isInteger(t.c) || t.c < 0 || !Number.isFinite(t.e)) return null;
    if (t.e <= now.getTime()) return null;
    return t;
  } catch {
    return null;
  }
}

/** The key: LOYALTY_SECRET, else derived from ADMIN_SESSION_SECRET under its own label (always set where the database is). */
export function loyaltySecret(env: Record<string, string | undefined> = process.env): string {
  if (env.LOYALTY_SECRET) return env.LOYALTY_SECRET;
  if (env.ADMIN_SESSION_SECRET) return createHmac("sha256", env.ADMIN_SESSION_SECRET).update("govita:loyalty-secret:v1").digest("base64url");
  if (env.NODE_ENV === "production") throw new Error("LOYALTY_SECRET (or ADMIN_SESSION_SECRET) must be set");
  return "dev-only-loyalty-secret";
}
