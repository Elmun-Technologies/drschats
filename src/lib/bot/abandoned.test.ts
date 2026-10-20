import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const execute = vi.fn();
vi.mock("@/lib/db/client", () => ({ getDb: () => ({ execute }) }));
vi.mock("@/lib/flows/engine", () => ({ enrollSubject: vi.fn(async () => "enrolled") }));
vi.mock("./shop", () => ({ quoteBotCart: vi.fn() }));

const { enrollSubject } = await import("@/lib/flows/engine");
const { quoteBotCart } = await import("./shop");
const { sweepBotCarts, touchMoment, ABANDON_AFTER_MS } = await import("./abandoned");

const cart = {
  locale: "uz",
  lines: [{ slug: "omega-3", name: "Omega-3", price: 129000, qty: 2, lineTotal: 258000 }],
  issues: [],
  totals: { subtotal: 258000, discount: 0, shipping: 0, total: 258000, itemCount: 2 },
  promo: { code: null, ok: false },
};

describe("bot cart sweep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execute.mockReset();
  });

  it("enrols an idle cart into the same abandoned-cart flow, per cart touch", async () => {
    execute.mockResolvedValueOnce([{ chat_id: "7", phone: "998901234567", name: "Ali", locale: "uz", touched: "20261019T050000" }]);
    (quoteBotCart as ReturnType<typeof vi.fn>).mockResolvedValueOnce(cart);
    const now = new Date("2026-10-19T10:00:00Z");
    await expect(sweepBotCarts(now)).resolves.toEqual({ candidates: 1, enrolled: 1 });
    expect(enrollSubject).toHaveBeenCalledWith({
      flowId: "cart-abandoned",
      subject: "901234567",
      cycle: "bot:7:20261019T050000",
      // Counted from the abandonment, not from the sweep: same rule as the site.
      anchor: new Date("2026-10-19T05:00:00Z"),
      context: expect.objectContaining({ name: "Ali", locale: "uz", cartValue: 258000, source: "telegram_bot" }),
    });
    // The window really is "idle for at least two hours, no older than 26".
    const sql = execute.mock.calls[0][0];
    const values = sql.queryChunks.filter((c: unknown) => typeof c === "string");
    expect(values.length).toBeGreaterThan(0);
    expect(now.getTime() - ABANDON_AFTER_MS).toBe(Date.parse("2026-10-19T08:00:00Z"));
  });

  it("reads the compact touch stamp as UTC", () => {
    expect(touchMoment("20261019T050000").toISOString()).toBe("2026-10-19T05:00:00.000Z");
    expect(touchMoment("20261231T235959").toISOString()).toBe("2026-12-31T23:59:59.000Z");
  });

  it("skips carts that emptied between the query and the read", async () => {
    execute.mockResolvedValueOnce([{ chat_id: "8", phone: "998901234567", name: null, locale: "ru", touched: "20261019T050000" }]);
    (quoteBotCart as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ...cart, lines: [], totals: { ...cart.totals, total: 0 } });
    await expect(sweepBotCarts()).resolves.toEqual({ candidates: 1, enrolled: 0 });
    expect(enrollSubject).not.toHaveBeenCalled();
  });

  it("never throws when the sweep query fails", async () => {
    execute.mockRejectedValueOnce(new Error('relation "bot_carts" does not exist'));
    await expect(sweepBotCarts()).resolves.toEqual({ candidates: 0, enrolled: 0 });
  });
});
