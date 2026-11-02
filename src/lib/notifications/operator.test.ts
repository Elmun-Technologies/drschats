import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/integrations/settings", () => ({
  getRuntimeIntegrationSettings: vi.fn(async () => ({ operatorBotToken: "1:T", operatorChatId: "-100" })),
}));

const { notifyOperator } = await import("./operator");

const response = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

describe("notifyOperator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function run(fetchMock: ReturnType<typeof vi.fn>) {
    vi.stubGlobal("fetch", fetchMock);
    const result = notifyOperator("new order");
    await vi.runAllTimersAsync();
    return result;
  }

  it("retries a network error and a 5xx, then delivers", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(response(502)).mockResolvedValueOnce(response(200));
    await expect(run(fetchMock)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("honours retry_after on 429", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response(429, { parameters: { retry_after: 2 } })).mockResolvedValueOnce(response(200));
    await expect(run(fetchMock)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx refusal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(400));
    await expect(run(fetchMock)).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after three attempts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(503));
    await expect(run(fetchMock)).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("splitForTelegram", () => {
  it("keeps a short message whole", async () => {
    const { splitForTelegram } = await import("./operator");
    expect(splitForTelegram("a\nb")).toEqual(["a\nb"]);
  });

  it("splits at line breaks under the limit, losing nothing", async () => {
    const { splitForTelegram } = await import("./operator");
    const lines = Array.from({ length: 60 }, (_, i) => `${i + 1}. Mahsulot nomi juda uzun × 2 — 158 000 soʻm`);
    const parts = splitForTelegram(lines.join("\n"), 500);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((p) => p.length <= 500)).toBe(true);
    expect(parts.join("\n")).toBe(lines.join("\n"));
  });

  it("cuts a single line longer than the limit", async () => {
    const { splitForTelegram } = await import("./operator");
    const parts = splitForTelegram("x".repeat(1200), 500);
    expect(parts.map((p) => p.length)).toEqual([500, 500, 200]);
  });
});
