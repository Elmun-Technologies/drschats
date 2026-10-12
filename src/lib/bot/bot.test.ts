import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isBotCaller } from "./auth";
import { DEFAULT_CLUB, readClubConfig } from "./config";
import { escapeHtml, orderStatusMessage, ticketReplyMessage } from "./messages";
import { normalizeUzPhone, phoneTail } from "./phone";
import { verifyInitData } from "./webapp";

vi.mock("./store", () => ({
  getClubConfig: vi.fn(async () => DEFAULT_CLUB),
  linkContact: vi.fn(async () => ({ ok: true, phone: "998901234567" })),
  memberLocale: vi.fn(async () => "uz"),
  linkOf: vi.fn(async () => null),
  startMember: vi.fn(async () => undefined),
  orderFor: vi.fn(async () => null),
  claimJobs: vi.fn(async () => []),
  receipt: vi.fn(async () => true),
}));
const store = await import("./store");
const { handleBotApi } = await import("./api");

describe("phone", () => {
  it("normalises Uzbek mobile numbers", () => {
    expect(normalizeUzPhone("+998 (90) 123-45-67")).toBe("998901234567");
    expect(normalizeUzPhone("90 123 45 67")).toBe("998901234567");
    expect(normalizeUzPhone("+7 901 234 56 78")).toBeNull();
    expect(phoneTail("8 90 123 45 67")).toBe("901234567");
  });
});

describe("club config", () => {
  it("falls back to defaults for missing or invalid stored data", () => {
    expect(readClubConfig(null)).toEqual(DEFAULT_CLUB);
    expect(readClubConfig({ clubName: "Klub" }).clubName).toBe("Klub");
    expect(readClubConfig({ shopUrl: "http://insecure.example" })).toEqual(DEFAULT_CLUB);
  });
});

describe("bot caller", () => {
  const key = "k".repeat(32);
  it("accepts only the configured bearer key", () => {
    expect(isBotCaller(`Bearer ${key}`, key)).toBe(true);
    expect(isBotCaller(`Bearer ${key}x`, key)).toBe(false);
    expect(isBotCaller(key, key)).toBe(false);
    expect(isBotCaller(null, key)).toBe(false);
  });
  it("is closed when the key is missing or short", () => {
    expect(isBotCaller("Bearer short", "short")).toBe(false);
    expect(isBotCaller("Bearer ", undefined)).toBe(false);
  });
});

describe("Mini App initData", () => {
  const token = "123456:TEST-token";
  const now = Date.parse("2026-10-12T10:00:00Z");
  function sign(fields: Record<string, string>, botToken = token) {
    const check = Object.entries(fields).map(([k, v]) => `${k}=${v}`).sort().join("\n");
    const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
    const hash = createHmac("sha256", secret).update(check).digest("hex");
    return new URLSearchParams({ ...fields, hash }).toString();
  }
  const fields = { auth_date: String(now / 1000 - 60), query_id: "q1", user: JSON.stringify({ id: 555, first_name: "Ali" }) };

  it("returns the user for data Telegram signed", () => {
    expect(verifyInitData(sign(fields), token, now)).toEqual({ id: 555, firstName: "Ali", username: undefined, languageCode: undefined });
  });
  it("refuses a forged, re-signed or stale string", () => {
    const forged = sign(fields).replace("555", "556");
    expect(verifyInitData(forged, token, now)).toBeNull();
    expect(verifyInitData(sign(fields, "999:OTHER"), token, now)).toBeNull();
    expect(verifyInitData(sign({ ...fields, auth_date: String(now / 1000 - 3 * 86400) }), token, now)).toBeNull();
    expect(verifyInitData(sign(fields), undefined, now)).toBeNull();
  });
});

describe("messages", () => {
  it("escapes everything that came from the database", () => {
    expect(escapeHtml("<b>&")).toBe("&lt;b&gt;&amp;");
    expect(ticketReplyMessage("1 < 2", "uz").text).toContain("1 &lt; 2");
  });
  it("speaks the member's language and links the order card", () => {
    const m = orderStatusMessage("new", { number: "GV-000007", total: 158000 }, "ru");
    expect(m.text).toContain("№GV-000007");
    expect(m.text).toContain("158 000 сум");
    expect(m.buttons?.[0][0].callback_data).toBe("ord:GV-000007");
  });
});

describe("bot API routing", () => {
  beforeEach(() => vi.clearAllMocks());
  const q = new URLSearchParams();

  it("links only the user's own contact", async () => {
    const other = await handleBotApi("POST", ["contacts"], { telegramUserId: 1, contactUserId: 2, chatId: 1, phone: "901234567" }, q);
    expect(other.status).toBe(422);
    expect(store.linkContact).not.toHaveBeenCalled();
    const own = await handleBotApi("POST", ["contacts"], { telegramUserId: 1, contactUserId: 1, chatId: 1, phone: "901234567" }, q);
    expect(own.status).toBe(200);
  });

  it("drops a malformed deep-link source instead of failing /start", async () => {
    const r = await handleBotApi("POST", ["members", "7", "start"], { locale: "uz", source: "x y!" }, q);
    expect(r.status).toBe(200);
    expect(store.startMember).toHaveBeenCalledWith(7, "uz", undefined);
  });

  it("routes order numbers and outbox ids", async () => {
    expect((await handleBotApi("GET", ["customers", "7", "orders", "GV-000001"], undefined, q)).status).toBe(404);
    expect(store.orderFor).toHaveBeenCalledWith(7, "GV-000001", "uz");
    expect((await handleBotApi("GET", ["customers", "7", "orders", "../x"], undefined, q)).status).toBe(404);
    const r = await handleBotApi("POST", ["outbox", "3", "receipt"], { leaseToken: "a".repeat(32), result: "retry", retryAfter: 5 }, q);
    expect(r.status).toBe(200);
    expect(store.receipt).toHaveBeenCalledWith(3, "a".repeat(32), { result: "retry", retryAfter: 5 });
    expect((await handleBotApi("POST", ["outbox", "claim"], {}, q)).status).toBe(200);
    expect((await handleBotApi("DELETE", ["config"], undefined, q)).status).toBe(404);
  });
});
