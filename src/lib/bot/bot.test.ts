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
vi.mock("./shop", () => ({
  botCategories: vi.fn(async () => [{ slug: "vitamins", name: "Vitaminlar", count: 4 }]),
  botCatalog: vi.fn(async (input: { page: number }) => ({ locale: "uz", categories: [], items: [], total: 0, page: input.page, pages: 1 })),
  botProduct: vi.fn(async (slug: string) => (slug === "delical-vanil-200ml" ? { slug, name: "Delical", price: 118000, inStock: true } : null)),
  botLocale: vi.fn(async () => "uz"),
  quoteBotCart: vi.fn(async () => ({ locale: "uz", lines: [], issues: [], totals: {}, promo: { code: null, ok: false }, firstOrder: {}, adjustment: null })),
  addToCart: vi.fn(async () => ({ added: true })),
  setCartQuantity: vi.fn(async () => ({})),
  clearCart: vi.fn(async () => undefined),
  setCartPromo: vi.fn(async () => undefined),
  placeBotOrder: vi.fn(async () => ({ ok: true, orderId: "GV-000123", total: 118000, alreadyCreated: false })),
  reorderToCart: vi.fn(async () => 1),
  setBotLocale: vi.fn(async () => undefined),
}));
const store = await import("./store");
const shop = await import("./shop");
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

describe("bot shop API contract", () => {
  beforeEach(() => vi.clearAllMocks());
  const q = new URLSearchParams();

  it("lists categories and passes catalogue filters through", async () => {
    const cats = await handleBotApi("GET", ["shop", "categories"], undefined, new URLSearchParams("locale=ru"));
    expect(cats.status).toBe(200);
    expect(shop.botCategories).toHaveBeenCalledWith("ru");

    const list = await handleBotApi("GET", ["shop", "catalog"], undefined, new URLSearchParams("locale=uz&page=2&category=vitamins&q=vit"));
    expect(list.status).toBe(200);
    expect(shop.botCatalog).toHaveBeenCalledWith({ locale: "uz", page: 2, category: "vitamins", q: "vit" });
    expect((await handleBotApi("GET", ["shop", "catalog"], undefined, new URLSearchParams("locale=de"))).status).toBe(422);
  });

  it("returns a product card with the BAD warning and 404 for an unknown slug", async () => {
    const r = await handleBotApi("GET", ["shop", "product", "delical-vanil-200ml"], undefined, new URLSearchParams("locale=uz"));
    expect(r.status).toBe(200);
    expect((r.body as { product: { price: number } }).product.price).toBe(118000);
    expect((r.body as { disclaimer: string }).disclaimer).toContain("Dori vositasi emas");
    expect((await handleBotApi("GET", ["shop", "product", "nope"], undefined, q)).status).toBe(404);
    expect((await handleBotApi("GET", ["shop", "product", "x".repeat(161)], undefined, q)).status).toBe(422);
  });

  it("reads the server-side cart and the language before a phone is linked", async () => {
    const r = await handleBotApi("GET", ["shop", "cart"], undefined, new URLSearchParams("chatId=7&locale=uz"));
    expect(r.status).toBe(200);
    expect(shop.quoteBotCart).toHaveBeenCalledWith({ chatId: 7, locale: "uz" });
    expect((await handleBotApi("GET", ["shop", "cart"], undefined, q)).status).toBe(422);
    const locale = await handleBotApi("GET", ["shop", "locale"], undefined, new URLSearchParams("chatId=7"));
    expect(locale).toEqual({ status: 200, body: { locale: "uz" } });
  });

  it("adds, caps and clears cart lines", async () => {
    const add = await handleBotApi("POST", ["shop", "cart", "add"], { chatId: 11, slug: "delical-vanil-200ml", qty: 2 }, q);
    expect(add.status).toBe(201);
    expect(shop.addToCart).toHaveBeenCalledWith(11, "delical-vanil-200ml", 2);

    (shop.addToCart as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ added: false, reason: "qty_cap" });
    const capped = await handleBotApi("POST", ["shop", "cart", "add"], { chatId: 11, slug: "delical-vanil-200ml", qty: 1 }, q);
    expect(capped).toEqual({ status: 409, body: { error: "qty_cap" } });

    await handleBotApi("POST", ["shop", "cart", "set"], { chatId: 11, slug: "delical-vanil-200ml", qty: 0 }, q);
    expect(shop.setCartQuantity).toHaveBeenCalledWith(11, "delical-vanil-200ml", 0);
    await handleBotApi("POST", ["shop", "cart", "clear"], { chatId: 11 }, q);
    expect(shop.clearCart).toHaveBeenCalledWith(11);
  });

  it("rate-limits cart spam per chat", async () => {
    let last = { status: 0 };
    for (let i = 1; i <= 41; i++) {
      last = await handleBotApi("POST", ["shop", "cart", "add"], { chatId: 12, slug: "delical-vanil-200ml", qty: 1 }, q);
    }
    expect(last).toEqual({ status: 429, body: { error: "rate_limited" } });
  });

  it("stores a promo and quotes pickup separately", async () => {
    const promo = await handleBotApi("POST", ["shop", "promo"], { chatId: 13, code: "GOVITA10" }, q);
    expect(promo.status).toBe(200);
    expect(shop.setCartPromo).toHaveBeenCalledWith(13, "GOVITA10");

    const quote = await handleBotApi("POST", ["shop", "quote"], { chatId: 13, method: "pickup" }, q);
    expect(quote.status).toBe(200);
    expect(shop.quoteBotCart).toHaveBeenLastCalledWith({ chatId: 13, locale: undefined, method: "pickup", promoCode: undefined });
  });

  it("validates and creates an order once", async () => {
    const body = {
      chatId: 14,
      locale: "uz",
      name: "Ali Valiyev",
      phone: "+998901234567",
      method: "courier",
      region: "Toshkent shahri",
      address: "Amir Temur 12",
      idempotencyKey: "a".repeat(16),
    };
    const r = await handleBotApi("POST", ["shop", "order"], body, q);
    expect(r.status).toBe(201);
    expect(shop.placeBotOrder).toHaveBeenCalledWith({ ...body, locale: "uz", region: "Toshkent shahri" });

    expect((await handleBotApi("POST", ["shop", "order"], { ...body, chatId: 15, phone: "12" }, q)).status).toBe(422);
    expect((await handleBotApi("POST", ["shop", "order"], { ...body, chatId: 16, idempotencyKey: "short" }, q)).status).toBe(422);
  });

  it("maps shop failures to explicit statuses the bot can explain", async () => {
    const body = {
      chatId: 17,
      name: "Ali",
      phone: "+998901234567",
      method: "courier" as const,
      region: "Toshkent",
      address: "Amir Temur 12",
      idempotencyKey: "b".repeat(16),
    };
    (shop.placeBotOrder as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "out_of_stock", slug: "delical", available: 0 });
    expect(await handleBotApi("POST", ["shop", "order"], body, q)).toEqual({
      status: 409,
      body: { error: "out_of_stock", slug: "delical", available: 0 },
    });

    (shop.placeBotOrder as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "promo_invalid", reason: "expired" });
    expect(await handleBotApi("POST", ["shop", "order"], { ...body, chatId: 18 }, q)).toEqual({
      status: 422,
      body: { error: "promo_invalid", reason: "expired" },
    });

    (shop.placeBotOrder as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "pending" });
    expect((await handleBotApi("POST", ["shop", "order"], { ...body, chatId: 19 }, q)).status).toBe(425);

    (shop.placeBotOrder as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, error: "not_linked" });
    expect((await handleBotApi("POST", ["shop", "order"], { ...body, chatId: 20 }, q)).status).toBe(409);
  });

  it("reorders only the items still on sale", async () => {
    (store.orderFor as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: [
        { slug: "delical-vanil-200ml", qty: 2 },
        { slug: "gone", qty: 1 },
      ],
    });
    const r = await handleBotApi("POST", ["shop", "reorder"], { chatId: 21, orderNumber: "GV-000123" }, q);
    expect(r.status).toBe(200);
    expect(shop.reorderToCart).toHaveBeenCalledWith(21, [
      { slug: "delical-vanil-200ml", qty: 2 },
      { slug: "gone", qty: 1 },
    ], "uz");
    expect((await handleBotApi("POST", ["shop", "reorder"], { chatId: 21, orderNumber: "nope" }, q)).status).toBe(422);
    (shop.reorderToCart as ReturnType<typeof vi.fn>).mockResolvedValueOnce(0);
    (store.orderFor as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ items: [] });
    expect((await handleBotApi("POST", ["shop", "reorder"], { chatId: 22, orderNumber: "GV-000124" }, q)).status).toBe(409);
  });

  it("remembers the chosen language", async () => {
    const r = await handleBotApi("POST", ["shop", "locale"], { chatId: 23, locale: "ru" }, q);
    expect(r).toEqual({ status: 200, body: { ok: true, locale: "ru" } });
    expect(shop.setBotLocale).toHaveBeenCalledWith(23, "ru");
    expect((await handleBotApi("POST", ["shop", "locale"], { chatId: 23, locale: "de" }, q)).status).toBe(422);
  });
});
