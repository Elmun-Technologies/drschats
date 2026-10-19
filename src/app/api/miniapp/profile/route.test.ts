import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/telegram/profile", () => ({ miniAppProfile: vi.fn() }));
const { miniAppProfile } = await import("@/lib/telegram/profile");
const { POST } = await import("./route");

function req(body: unknown) {
  return new Request("http://localhost/api/miniapp/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/miniapp/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is closed when the club bot is not configured", async () => {
    vi.stubEnv("TELEGRAM_CLUB_BOT_TOKEN", "");
    const res = await POST(req({ initData: "x" }));
    expect(res.status).toBe(404);
    expect(miniAppProfile).not.toHaveBeenCalled();
  });

  it("answers only for verified initData", async () => {
    vi.stubEnv("TELEGRAM_CLUB_BOT_TOKEN", "123:token");
    (miniAppProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    expect((await POST(req({ initData: "forged" }))).status).toBe(401);
    (miniAppProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ name: "Ali", phone: "+998901234567" });
    const ok = await POST(req({ initData: "signed" }));
    expect(ok.status).toBe(200);
    await expect(ok.json()).resolves.toEqual({ name: "Ali", phone: "+998901234567" });
    expect(ok.headers.get("cache-control")).toBe("no-store");
  });

  it("treats a non-JSON or oversized body as unsigned", async () => {
    vi.stubEnv("TELEGRAM_CLUB_BOT_TOKEN", "123:token");
    (miniAppProfile as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const bad = new Request("http://localhost/api/miniapp/profile", { method: "POST", body: "not json" });
    expect((await POST(bad)).status).toBe(401);
    expect(miniAppProfile).toHaveBeenLastCalledWith(undefined);

    await POST(req({ initData: "a".repeat(5000) }));
    expect((miniAppProfile as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]).toHaveLength(4096);
  });
});
