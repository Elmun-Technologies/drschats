import { describe, it, expect, beforeAll } from "vitest";
import { signToken, verifyToken } from "./token";

beforeAll(() => {
  process.env.EMAIL_TOKEN_SECRET = "test-secret";
});

describe("email tokens", () => {
  it("round-trips an address, normalised", () => {
    const token = signToken("unsubscribe", "  Aziza@Example.COM ");
    expect(verifyToken(token, "unsubscribe")).toEqual({
      email: "aziza@example.com",
      purpose: "unsubscribe",
    });
  });

  it("refuses a token issued for another purpose", () => {
    const token = signToken("opt-in", "aziza@example.com");
    expect(verifyToken(token, "unsubscribe")).toBeNull();
  });

  it("refuses a tampered payload", () => {
    const token = signToken("unsubscribe", "aziza@example.com");
    const [, signature] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ p: "unsubscribe", e: "victim@example.com" })).toString("base64url")}.${signature}`;
    expect(verifyToken(forged, "unsubscribe")).toBeNull();
  });

  it("refuses junk", () => {
    expect(verifyToken("", "opt-in")).toBeNull();
    expect(verifyToken("nodot", "opt-in")).toBeNull();
    expect(verifyToken("a.b", "opt-in")).toBeNull();
  });

  it("expires an opt-in link but not an unsubscribe link", () => {
    const optIn = signToken("opt-in", "aziza@example.com");
    const unsubscribe = signToken("unsubscribe", "aziza@example.com");

    const eightDays = Date.now() + 8 * 24 * 60 * 60 * 1000;
    const realNow = Date.now;
    Date.now = () => eightDays;
    try {
      expect(verifyToken(optIn, "opt-in")).toBeNull();
      expect(verifyToken(unsubscribe, "unsubscribe")).not.toBeNull();
    } finally {
      Date.now = realNow;
    }
  });
});
