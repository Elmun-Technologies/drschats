import { describe, expect, it } from "vitest";
import { createSessionToken, readSessionToken, SESSION_IDLE_MS } from "./session";
import { refreshedSessionToken } from "./session-edge";
import { requestIdFrom } from "@/lib/request-id";

describe("admin session idle timeout", () => {
  it("ends a session left alone for longer than the idle window", () => {
    const issued = Date.now() - SESSION_IDLE_MS - 60_000;
    expect(readSessionToken(createSessionToken(7, 1, issued))).toBeNull();
    expect(readSessionToken(createSessionToken(7, 1, Date.now() - 60_000))).toEqual({ uid: 7, epoch: 1 });
  });

  it("the middleware's re-signed token is a valid session for the server", async () => {
    const old = createSessionToken(7, 2, Date.now() - 3 * 3_600_000);
    const fresh = await refreshedSessionToken(old);
    expect(fresh).not.toBeNull();
    expect(readSessionToken(fresh!)).toEqual({ uid: 7, epoch: 2 });
    // The absolute expiry does not move.
    const exp = (t: string) => JSON.parse(Buffer.from(t.split(".")[0], "base64url").toString()).exp;
    expect(exp(fresh!)).toBe(exp(old));
  });

  it("does not refresh a fresh, idle-expired, forged or pending token", async () => {
    expect(await refreshedSessionToken(createSessionToken(7, 0))).toBeNull();
    expect(await refreshedSessionToken(createSessionToken(7, 0, Date.now() - SESSION_IDLE_MS - 1000))).toBeNull();
    const [payload, mac] = createSessionToken(7, 0, Date.now() - 3_600_000).split(".");
    expect(await refreshedSessionToken(`${payload}.x${mac.slice(1)}`)).toBeNull();
    expect(await refreshedSessionToken(undefined)).toBeNull();
  });
});

describe("request id", () => {
  it("keeps a well-formed id and replaces anything else", () => {
    expect(requestIdFrom("abcd1234efgh")).toBe("abcd1234efgh");
    const made = requestIdFrom("bad id\nforged log line");
    expect(made).toMatch(/^[a-f0-9]{20}$/);
    expect(requestIdFrom(null)).toMatch(/^[a-f0-9]{20}$/);
  });
});
