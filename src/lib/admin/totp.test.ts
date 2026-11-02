import { describe, expect, it } from "vitest";
import { base32Decode, base32Encode, generateRecoveryCodes, generateTotpSecret, hashRecoveryCode, hotp, normalizeRecoveryCode, otpauthUrl, totp, verifyTotp } from "./totp";

// RFC 6238 appendix B (SHA1 seed "12345678901234567890"), last 6 digits.
const SEED = base32Encode(Buffer.from("12345678901234567890"));
const VECTORS: [number, string][] = [
  [59, "287082"],
  [1111111109, "081804"],
  [1111111111, "050471"],
  [1234567890, "005924"],
  [2000000000, "279037"],
  [20000000000, "353130"],
];

describe("TOTP", () => {
  it("matches the RFC 6238 test vectors", () => {
    for (const [seconds, code] of VECTORS) expect(totp(SEED, seconds * 1000)).toBe(code);
  });

  it("matches the RFC 4226 HOTP vectors", () => {
    const secret = Buffer.from("12345678901234567890");
    expect([0, 1, 2, 9].map((c) => hotp(secret, c))).toEqual(["755224", "287082", "359152", "520489"]);
  });

  it("round-trips base32", () => {
    const buf = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 7]);
    expect(base32Decode(base32Encode(buf))).toEqual(buf);
    expect(generateTotpSecret()).toMatch(/^[A-Z2-7]{32}$/);
  });

  it("accepts one step of drift, refuses older steps and replays", () => {
    const now = 1_700_000_000_000;
    const code = totp(SEED, now);
    const step = verifyTotp(SEED, code, { now });
    expect(step).toBe(Math.floor(now / 30000));
    expect(verifyTotp(SEED, code, { now: now + 30_000 })).toBe(step);
    expect(verifyTotp(SEED, code, { now: now + 90_000 })).toBeNull();
    expect(verifyTotp(SEED, code, { now, lastStep: step })).toBeNull();
    expect(verifyTotp(SEED, "12345", { now })).toBeNull();
    expect(verifyTotp(SEED, "abcdef", { now })).toBeNull();
  });

  it("builds an otpauth link apps understand", () => {
    const url = new URL(otpauthUrl("ABC", "a@b.uz"));
    expect(url.protocol).toBe("otpauth:");
    expect(url.searchParams.get("secret")).toBe("ABC");
    expect(url.searchParams.get("issuer")).toBe("Go Vita admin");
  });
});

describe("recovery codes", () => {
  it("are ten distinct xxxxx-xxxxx codes, hashed regardless of case and dashes", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    for (const c of codes) expect(c).toMatch(/^[a-z2-9]{5}-[a-z2-9]{5}$/);
    expect(hashRecoveryCode(codes[0].toUpperCase().replace("-", " "))).toBe(hashRecoveryCode(codes[0]));
    expect(normalizeRecoveryCode("short")).toBe("");
  });
});
