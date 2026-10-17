import { describe, expect, it } from "vitest";
import { OTP_MAX_ATTEMPTS, OTP_TTL_MS, checkOtp, generateOtp, hashOtp, loyaltySecret, signRedeemToken, verifyRedeemToken } from "./otp";

const SECRET = "test-secret-0123456789";
const now = new Date("2026-10-17T10:00:00Z");
const row = (code: string, extra: Partial<{ attempts: number; expiresAt: Date; consumedAt: Date | null }> = {}) => ({
  codeHash: hashOtp("901234567", code, SECRET),
  attempts: 0,
  expiresAt: new Date(now.getTime() + OTP_TTL_MS),
  consumedAt: null,
  ...extra,
});

describe("one-time code", () => {
  it("is six digits", () => {
    let i = 0;
    expect(generateOtp(() => i++ % 10)).toBe("012345");
    expect(generateOtp(() => 9)).toMatch(/^\d{6}$/);
  });

  it("stores a keyed hash bound to the phone, never the code", () => {
    const h = hashOtp("901234567", "123456", SECRET);
    expect(h).not.toContain("123456");
    expect(hashOtp("901234568", "123456", SECRET)).not.toBe(h);
    expect(hashOtp("901234567", "123456", "other-secret")).not.toBe(h);
  });

  it("accepts the right code for the right phone, with spaces typed", () => {
    expect(checkOtp(row("123456"), "901234567", "123 456", SECRET, now)).toBe("ok");
    expect(checkOtp(row("123456"), "901234567", "123457", SECRET, now)).toBe("wrong");
    expect(checkOtp(row("123456"), "901234568", "123456", SECRET, now)).toBe("wrong");
    expect(checkOtp(row("123456"), "901234567", "12345", SECRET, now)).toBe("wrong");
  });

  it("lives five minutes", () => {
    expect(checkOtp(row("123456"), "901234567", "123456", SECRET, new Date(now.getTime() + OTP_TTL_MS - 1))).toBe("ok");
    expect(checkOtp(row("123456"), "901234567", "123456", SECRET, new Date(now.getTime() + OTP_TTL_MS))).toBe("expired");
  });

  it("allows five attempts, then locks even the right code", () => {
    expect(OTP_MAX_ATTEMPTS).toBe(5);
    expect(checkOtp(row("123456", { attempts: 4 }), "901234567", "123456", SECRET, now)).toBe("ok");
    expect(checkOtp(row("123456", { attempts: 5 }), "901234567", "123456", SECRET, now)).toBe("locked");
  });

  it("works once", () => {
    expect(checkOtp(row("123456", { consumedAt: now }), "901234567", "123456", SECRET, now)).toBe("used");
  });
});

describe("redemption token", () => {
  const token = signRedeemToken({ p: "901234567", c: 15_000, e: now.getTime() + 60_000 }, SECRET);

  it("round-trips with phone and cap", () => {
    expect(verifyRedeemToken(token, SECRET, now)).toEqual({ p: "901234567", c: 15_000, e: now.getTime() + 60_000 });
  });

  it("rejects a tampered, foreign, expired or garbage token", () => {
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ p: "901234567", c: 9_999_999, e: now.getTime() + 60_000 })).toString("base64url");
    expect(verifyRedeemToken(`${forged}.${sig}`, SECRET, now)).toBeNull();
    expect(verifyRedeemToken(`${body}.${sig}x`, SECRET, now)).toBeNull();
    expect(verifyRedeemToken(token, "other-secret", now)).toBeNull();
    expect(verifyRedeemToken(token, SECRET, new Date(now.getTime() + 60_000))).toBeNull();
    expect(verifyRedeemToken("nope", SECRET, now)).toBeNull();
    expect(verifyRedeemToken(undefined, SECRET, now)).toBeNull();
  });
});

describe("loyaltySecret", () => {
  it("prefers LOYALTY_SECRET, derives from the session secret, refuses none in production", () => {
    expect(loyaltySecret({ LOYALTY_SECRET: "a" })).toBe("a");
    const derived = loyaltySecret({ ADMIN_SESSION_SECRET: "s".repeat(40) });
    expect(derived).not.toContain("sss");
    expect(derived).toBe(loyaltySecret({ ADMIN_SESSION_SECRET: "s".repeat(40) }));
    expect(() => loyaltySecret({ NODE_ENV: "production" })).toThrow();
  });
});
