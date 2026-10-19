import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/bot/store", () => ({ linkOf: vi.fn(async () => null) }));
vi.mock("server-only", () => ({}));

const { linkOf } = await import("@/lib/bot/store");
const { miniAppProfile } = await import("./profile");

const TOKEN = "123456:TEST-token-for-miniapp";
const NOW = Date.parse("2026-10-19T10:00:00Z");

function sign(fields: Record<string, string>, botToken = TOKEN) {
  const check = Object.entries(fields).map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secret).update(check).digest("hex");
  return new URLSearchParams({ ...fields, hash }).toString();
}

const fields = {
  auth_date: String(Math.floor(NOW / 1000) - 60),
  query_id: "q1",
  user: JSON.stringify({ id: 555, first_name: "Ali" }),
};

describe("Mini App profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TELEGRAM_CLUB_BOT_TOKEN", TOKEN);
  });

  it("returns the linked name and phone for signed data", async () => {
    (linkOf as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ chatId: 555, phone: "998901234567", name: "Ali Valiyev" });
    await expect(miniAppProfile(sign(fields))).resolves.toEqual({ name: "Ali Valiyev", phone: "+998901234567" });
    expect(linkOf).toHaveBeenCalledWith(555);
  });

  it("falls back to the Telegram first name when nothing is linked", async () => {
    await expect(miniAppProfile(sign(fields))).resolves.toEqual({ name: "Ali", phone: null });
  });

  it("refuses forged, stale or missing initData", async () => {
    expect(await miniAppProfile(sign(fields).replace("555", "556"))).toBeNull();
    expect(await miniAppProfile(sign(fields, "999:OTHER"))).toBeNull();
    expect(await miniAppProfile(sign({ ...fields, auth_date: String(Math.floor(NOW / 1000) - 3 * 86400) }))).toBeNull();
    expect(await miniAppProfile(undefined)).toBeNull();
    expect(linkOf).not.toHaveBeenCalled();
  });

  it("still prefills the name when the database is unavailable", async () => {
    (linkOf as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("DATABASE_URL is not set"));
    await expect(miniAppProfile(sign(fields))).resolves.toEqual({ name: "Ali", phone: null });
  });
});
