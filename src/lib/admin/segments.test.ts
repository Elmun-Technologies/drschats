import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const execute = vi.fn();
vi.mock("@/lib/db/client", () => ({ getDb: () => ({ execute }) }));

const { campaignTargetKey, segmentById, segmentCounts, segmentMembers } = await import("./segments");

describe("bot audiences", () => {
  beforeEach(() => execute.mockReset());

  it("keys a recipient by phone tail, or by chat when the phone is not linked", () => {
    expect(campaignTargetKey("901234567", 555)).toBe("901234567");
    expect(campaignTargetKey(null, 555)).toBe("tg555");
    expect(campaignTargetKey("12345", 555)).toBe("tg555");
    expect(campaignTargetKey(null, null)).toBeNull();
  });

  it("defines the five Telegram audiences as bot segments", () => {
    const ids = ["bot-all", "bot-linked", "bot-buyers", "bot-new", "bot-cart"];
    for (const id of ids) expect(segmentById(id)?.kind).toBe("bot");
    expect(segmentById("bot-cart")?.value).toBeDefined();
  });

  it("reads bot counts as numbers, including the cart value", async () => {
    execute
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ "bot-all:size": "22", "bot-all:reach": "21", "bot-all:value": "3080400", "bot-cart:size": "5", "bot-cart:reach": "5", "bot-cart:value": "1274000" }]);
    const counts = await segmentCounts();
    expect(counts["bot-all"]).toEqual({ size: 22, reachable: 21, value: 3080400 });
    expect(counts["bot-cart"]).toEqual({ size: 5, reachable: 5, value: 1274000 });
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it("maps a phone-less cart member to a chat key and the cart value", async () => {
    execute.mockResolvedValueOnce([{
      chat_id: "555", name: null, phone: null, phone9: "", blocked_at: null,
      orders: "0", ltv: "0", last_at: null, cart_value: "258000", cart_at: "2026-10-19T05:00:00Z",
    }]);
    const [member] = await segmentMembers(segmentById("bot-cart")!, 10);
    expect(member).toMatchObject({ key: "tg555", phone: null, telegramChatId: 555, value: 258000 });
    expect(member.lastAt?.toISOString()).toBe("2026-10-19T05:00:00.000Z");
  });

  it("reports lifetime spend for a buyer, not the cart", async () => {
    execute.mockResolvedValueOnce([{
      chat_id: "700", name: "Ali", phone: "+998 90 123-45-67", phone9: "901234567", blocked_at: null,
      orders: "3", ltv: "450000", last_at: "2026-10-01T10:00:00Z", cart_value: "99000", cart_at: "2026-10-02T10:00:00Z",
    }]);
    const [member] = await segmentMembers(segmentById("bot-buyers")!, 10);
    expect(member).toMatchObject({ key: "tg700", orders: 3, value: 450000, phone: "+998 90 123-45-67" });
  });
});
