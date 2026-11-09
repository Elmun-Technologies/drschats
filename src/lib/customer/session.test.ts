import { describe, expect, it } from "vitest";
import { LOGIN_TOKEN_RE, describeDevice, hashSecret, maskPhone, readSession, sessionSecret, signSession } from "./session";

const secret = sessionSecret("test-loyalty-key");
const now = 1_800_000_000_000;
const session = { c: 123456789, p: "901234567", n: "Aziz", e: now + 60_000 };

describe("customer session cookie", () => {
  it("round-trips", () => {
    expect(readSession(signSession(session, secret), secret, now)).toEqual(session);
  });

  it("refuses another key, a tampered body and an expired session", () => {
    const raw = signSession(session, secret);
    expect(readSession(raw, sessionSecret("other"), now)).toBeNull();
    const [, sig] = raw.split(".");
    const forged = Buffer.from(JSON.stringify({ ...session, p: "991112233" })).toString("base64url");
    expect(readSession(`${forged}.${sig}`, secret, now)).toBeNull();
    expect(readSession(raw, secret, now + 120_000)).toBeNull();
  });

  it("refuses malformed values", () => {
    expect(readSession(undefined, secret, now)).toBeNull();
    expect(readSession("a.b.c", secret, now)).toBeNull();
    expect(readSession(signSession({ ...session, p: "12" }, secret), secret, now)).toBeNull();
    expect(readSession(signSession({ ...session, c: -1 }, secret), secret, now)).toBeNull();
  });

  it("keeps its key apart from the loyalty key", () => {
    expect(sessionSecret("k")).not.toBe("k");
  });
});

describe("sign-in helpers", () => {
  it("masks the phone the bot shows", () => {
    expect(maskPhone("998901234567")).toBe("+998 90 *** ** 67");
    expect(maskPhone("+998 (90) 123-45-67")).toBe("+998 90 *** ** 67");
    expect(maskPhone("123")).toBe("");
  });

  it("accepts only tokens Telegram can carry in a start payload", () => {
    expect(LOGIN_TOKEN_RE.test("a".repeat(32))).toBe(true);
    expect(LOGIN_TOKEN_RE.test("abc")).toBe(false);
    expect(LOGIN_TOKEN_RE.test("a".repeat(31) + "!")).toBe(false);
    expect(("login_" + "a".repeat(48)).length).toBeLessThanOrEqual(64);
  });

  it("names the browser without the full user agent", () => {
    expect(describeDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Version/17.0 Mobile Safari/604.1")).toBe("Safari, iPhone");
    expect(describeDevice("Mozilla/5.0 (Windows NT 10.0) Chrome/120.0 Safari/537.36")).toBe("Chrome, Windows");
    expect(describeDevice(null)).toBe("");
  });

  it("hashes secrets with a label", () => {
    expect(hashSecret("x")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSecret("x")).not.toBe(hashSecret("y"));
  });
});
