import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/*
  Time-based one-time passwords (RFC 6238 over RFC 4226): HMAC-SHA1, 30 s
  steps, 6 digits — what Google Authenticator, Microsoft Authenticator,
  1Password and the rest expect from an otpauth:// link.
*/

export const TOTP_STEP_SECONDS = 30;
const DIGITS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error("invalid base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** 160 random bits, the size RFC 4226 recommends. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function hotp(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac("sha1", secret).update(msg).digest();
  const offset = mac[mac.length - 1] & 0xf;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(code).padStart(DIGITS, "0");
}

export function totpStep(now = Date.now()): number {
  return Math.floor(now / 1000 / TOTP_STEP_SECONDS);
}

export function totp(secretBase32: string, now = Date.now()): string {
  return hotp(base32Decode(secretBase32), totpStep(now));
}

/**
 * The step a code belongs to, within one step of clock drift either way, or
 * null. Codes at or before `lastStep` are refused: each code signs in once.
 */
export function verifyTotp(secretBase32: string, code: string, options: { now?: number; lastStep?: number | null } = {}): number | null {
  const digits = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) return null;
  const secret = base32Decode(secretBase32);
  const current = totpStep(options.now);
  for (const step of [current, current - 1, current + 1]) {
    if (options.lastStep != null && step <= options.lastStep) continue;
    const expected = Buffer.from(hotp(secret, step));
    if (timingSafeEqual(expected, Buffer.from(digits))) return step;
  }
  return null;
}

export function otpauthUrl(secretBase32: string, account: string, issuer = "Go Vita admin"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const q = new URLSearchParams({ secret: secretBase32, issuer, algorithm: "SHA1", digits: String(DIGITS), period: String(TOTP_STEP_SECONDS) });
  return `otpauth://totp/${label}?${q.toString()}`;
}

/* ---------- recovery codes ---------- */

/** Ten one-time codes, xxxxx-xxxxx from an unambiguous alphabet (50 bits each). */
export function generateRecoveryCodes(n = 10): string[] {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: n }, () => {
    const bytes = randomBytes(10);
    const s = Array.from(bytes, (b) => chars[b % chars.length]).join("");
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
}

export function normalizeRecoveryCode(code: string): string {
  const s = code.toLowerCase().replace(/[^a-z0-9]/g, "");
  return s.length === 10 ? `${s.slice(0, 5)}-${s.slice(5)}` : "";
}

export function hashRecoveryCode(code: string): string {
  return createHmac("sha256", "govita:admin-recovery:v1").update(normalizeRecoveryCode(code)).digest("hex");
}
