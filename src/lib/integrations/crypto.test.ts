import { describe, expect, it } from "vitest";
import { decryptIntegrationValue, encryptIntegrationValue } from "./crypto";

const KEY = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

describe("encrypted integration settings", () => {
  it("round-trips values while storing a fresh nonce each time", () => {
    const first = encryptIntegrationValue("re_secret-value", "email.apiKey", KEY);
    const second = encryptIntegrationValue("re_secret-value", "email.apiKey", KEY);

    expect(first).not.toBe(second);
    expect(first).not.toContain("re_secret-value");
    expect(decryptIntegrationValue(first, "email.apiKey", KEY)).toBe("re_secret-value");
  });

  it("binds ciphertext to its setting name", () => {
    const ciphertext = encryptIntegrationValue("123456789:secret-token", "operator.botToken", KEY);
    expect(() => decryptIntegrationValue(ciphertext, "email.apiKey", KEY)).toThrow();
  });

  it("rejects ciphertext that has been altered", () => {
    const ciphertext = encryptIntegrationValue("private-value", "email.apiKey", KEY);
    const parts = ciphertext.split(".");
    parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;
    expect(() => decryptIntegrationValue(parts.join("."), "email.apiKey", KEY)).toThrow();
  });

  it("requires a 32-byte key", () => {
    expect(() => encryptIntegrationValue("x", "email.apiKey", Buffer.alloc(31))).toThrow(/32 bytes/);
    expect(() => decryptIntegrationValue("v1.a.b.c", "email.apiKey", Buffer.alloc(31))).toThrow(/32 bytes/);
  });
});
