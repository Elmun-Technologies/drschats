import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const execute = vi.fn();
vi.mock("@/lib/db/client", () => ({ getDb: () => ({ execute }) }));
vi.mock("@/lib/bot/store", () => ({ getClubConfig: vi.fn() }));
vi.mock("@/lib/promo/server", () => ({ issuePromoCode: vi.fn() }));
vi.mock("@/lib/sms", () => ({ resolveSmsProvider: vi.fn() }));

const { resolveChatReach } = await import("./outbox");

const ctx = { clubEnabled: true, smsAvailable: false };

describe("resolveChatReach", () => {
  beforeEach(() => execute.mockReset());

  it("reaches an active bot member by chat id, with no phone", async () => {
    execute.mockResolvedValueOnce([{ "?column?": 1 }]);
    await expect(resolveChatReach({ execute } as never, 555, ctx)).resolves.toEqual({ channel: "telegram", chatId: 555, phone9: null });
  });

  it("skips a blocked member", async () => {
    execute.mockResolvedValueOnce([]);
    await expect(resolveChatReach({ execute } as never, 555, ctx)).resolves.toEqual({ channel: null, reason: "blocked" });
  });

  it("skips everyone while the club is switched off", async () => {
    await expect(resolveChatReach({ execute } as never, 555, { ...ctx, clubEnabled: false })).resolves.toEqual({ channel: null, reason: "club_disabled" });
    expect(execute).not.toHaveBeenCalled();
  });
});
