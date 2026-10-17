import { beforeEach, describe, expect, it } from "vitest";
import { EskizProvider, eskizPhone, resetEskizTokens } from "./eskiz";

type Call = { url: string; auth: string | null; body: Record<string, string> };

function fakeFetch(responses: ((call: Call) => Response)[]) {
  const calls: Call[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body: Record<string, string> = {};
    if (init?.body instanceof FormData) for (const [k, v] of init.body.entries()) body[k] = String(v);
    const headers = new Headers(init?.headers);
    const call = { url: String(input), auth: headers.get("authorization"), body };
    calls.push(call);
    const next = responses.shift();
    if (!next) throw new Error("unexpected request");
    return next(call);
  }) as typeof fetch;
  return { impl, calls };
}

const json = (status: number, body: unknown) => () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const login = (token: string) => json(200, { message: "token_generated", data: { token }, token_type: "bearer" });

describe("EskizProvider", () => {
  beforeEach(() => resetEskizTokens());

  it("logs in, sends with the bearer token and caches it", async () => {
    const { impl, calls } = fakeFetch([login("T1"), json(200, { id: "abc", status: "waiting" }), json(200, { id: "def", status: "waiting" })]);
    const sms = new EskizProvider({ email: "a@b.uz", password: "p", sender: "GoVita", fetch: impl });
    expect(await sms.send("+998 90 123 45 67", "Salom")).toEqual({ ok: true, id: "abc" });
    expect(await sms.send("901234567", "Salom 2")).toEqual({ ok: true, id: "def" });
    expect(calls.map((c) => c.url)).toEqual([
      "https://notify.eskiz.uz/api/auth/login",
      "https://notify.eskiz.uz/api/message/sms/send",
      "https://notify.eskiz.uz/api/message/sms/send",
    ]);
    expect(calls[0].body).toEqual({ email: "a@b.uz", password: "p" });
    expect(calls[1].auth).toBe("Bearer T1");
    expect(calls[1].body).toEqual({ mobile_phone: "998901234567", message: "Salom", from: "GoVita" });
  });

  it("defaults the sender to 4546", async () => {
    const { impl, calls } = fakeFetch([login("T"), json(200, { id: 1 })]);
    await new EskizProvider({ email: "a@b.uz", password: "p", fetch: impl }).send("+998901234567", "x");
    expect(calls[1].body.from).toBe("4546");
  });

  it("logs in again once when the token expired", async () => {
    const { impl, calls } = fakeFetch([login("OLD"), json(401, { message: "Expired" }), login("NEW"), json(200, { id: "x" })]);
    const result = await new EskizProvider({ email: "a@b.uz", password: "p", fetch: impl }).send("+998901234567", "x");
    expect(result).toEqual({ ok: true, id: "x" });
    expect(calls[3].auth).toBe("Bearer NEW");
  });

  it("does not retry a rejected text but retries a server error", async () => {
    const a = fakeFetch([login("T"), json(400, { status: "error", message: "Text not approved" })]);
    expect(await new EskizProvider({ email: "a@b.uz", password: "p", fetch: a.impl }).send("+998901234567", "x")).toMatchObject({ ok: false, retryable: false });
    resetEskizTokens();
    const b = fakeFetch([login("T"), json(503, {})]);
    expect(await new EskizProvider({ email: "a@b.uz", password: "p", fetch: b.impl }).send("+998901234567", "x")).toMatchObject({ ok: false, retryable: true });
  });

  it("treats a 200 with status error as a failure", async () => {
    const { impl } = fakeFetch([login("T"), json(200, { status: "error", message: "Insufficient balance" })]);
    const result = await new EskizProvider({ email: "a@b.uz", password: "p", fetch: impl }).send("+998901234567", "x");
    expect(result).toMatchObject({ ok: false, retryable: false });
    expect(result.ok ? "" : result.error).toContain("Insufficient balance");
  });

  it("reports a rejected login and network failure", async () => {
    const a = fakeFetch([json(401, { message: "Invalid credentials" })]);
    expect(await new EskizProvider({ email: "a@b.uz", password: "bad", fetch: a.impl }).send("+998901234567", "x")).toEqual({ ok: false, retryable: false, error: "eskiz_login_rejected" });
    const b = fakeFetch([() => { throw new Error("ECONNRESET"); }]);
    expect(await new EskizProvider({ email: "a@b.uz", password: "p", fetch: b.impl }).send("+998901234567", "x")).toEqual({ ok: false, retryable: true, error: "eskiz_unreachable" });
  });

  it("refuses a non-Uzbek number without a request", async () => {
    const { impl, calls } = fakeFetch([]);
    expect(await new EskizProvider({ email: "a@b.uz", password: "p", fetch: impl }).send("+7 916 123 45 67", "x")).toMatchObject({ ok: false, error: "invalid_phone" });
    expect(calls).toHaveLength(0);
  });
});

describe("eskizPhone", () => {
  it("normalises to 998XXXXXXXXX", () => {
    expect(eskizPhone("+998 (90) 123-45-67")).toBe("998901234567");
    expect(eskizPhone("901234567")).toBe("998901234567");
    expect(eskizPhone("12345")).toBeNull();
  });
});
