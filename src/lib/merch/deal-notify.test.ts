import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const execute = vi.fn();
vi.mock("@/lib/db/client", () => ({ getDb: () => ({ execute }) }));
vi.mock("@/lib/notify/waitlist", () => ({ notifyWaitlist: vi.fn(async () => ({ due: 3, byChannel: {}, left: 0 })) }));

const { notifyWaitlist } = await import("@/lib/notify/waitlist");
const { notifyStartedDeals } = await import("./deal-notify");

describe("deal start sweep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execute.mockReset();
  });

  it("claims each started deal once and tells its waitlist", async () => {
    execute
      .mockResolvedValueOnce([{ deal_id: "4" }])
      .mockResolvedValueOnce([{ product_slug: "omega-3", product_id: "p-omega" }]);
    await expect(notifyStartedDeals(new Date("2026-10-19T10:00:00Z"))).resolves.toEqual({ started: 1, notified: 3 });
    expect(notifyWaitlist).toHaveBeenCalledWith("p-omega");
    // The claim is the insert itself: a second tick finds it already recorded
    // and inserts nothing, so nothing is sent twice.
    const claimedSql = execute.mock.calls[0][0].queryChunks.map((c: { value?: string[] }) => c.value?.join("") ?? "").join("");
    expect(claimedSql).toContain("insert into deal_notifications");
    expect(claimedSql).toContain("on conflict (deal_id) do nothing");
    execute.mockResolvedValueOnce([]);
    await expect(notifyStartedDeals()).resolves.toEqual({ started: 0, notified: 0 });
    expect(notifyWaitlist).toHaveBeenCalledTimes(1);
  });

  it("skips a deal whose product was deleted and keeps going", async () => {
    execute
      .mockResolvedValueOnce([{ deal_id: "5" }, { deal_id: "6" }])
      .mockResolvedValueOnce([{ product_slug: "gone", product_id: null }])
      .mockResolvedValueOnce([{ product_slug: "omega-3", product_id: "p-omega" }]);
    await expect(notifyStartedDeals()).resolves.toEqual({ started: 2, notified: 3 });
    expect(notifyWaitlist).toHaveBeenCalledTimes(1);
  });

  it("does not take the worker down when the table is missing", async () => {
    execute.mockRejectedValueOnce(new Error('relation "deal_notifications" does not exist'));
    await expect(notifyStartedDeals()).resolves.toEqual({ started: 0, notified: 0 });
    expect(notifyWaitlist).not.toHaveBeenCalled();
  });
});
