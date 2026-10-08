import { describe, expect, it } from "vitest";
import { createSessionToken, readSessionToken } from "./session";
import { hashPassword, verifyPassword } from "./password";

describe("admin session token", () => {
  it("round-trips a user id", () => {
    expect(readSessionToken(createSessionToken(42))).toBe(42);
  });

  it("rejects a tampered payload", () => {
    const [payload, mac] = createSessionToken(42).split(".");
    const forged = Buffer.from(JSON.stringify({ uid: 1, exp: Date.now() + 1e9 })).toString("base64url");
    expect(readSessionToken(`${forged}.${mac}`)).toBeNull();
    expect(readSessionToken(`${payload}.x${mac.slice(1)}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const old = createSessionToken(42, Date.now() - 8 * 864e5);
    expect(readSessionToken(old)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(readSessionToken(undefined)).toBeNull();
    expect(readSessionToken("abc")).toBeNull();
  });
});

describe("admin password hash", () => {
  it("verifies the right password only", async () => {
    const stored = await hashPassword("correct horse battery");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("wrong", stored)).toBe(false);
  });
});
