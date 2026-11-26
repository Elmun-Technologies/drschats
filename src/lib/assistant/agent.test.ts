import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  The loop against a scripted model: read tools run at once, a write call
  stops the loop for approval, and a role only sees its own tools.
*/
const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = { create }; } }));
vi.mock("@/lib/admin/i18n/server", async (importOriginal) => ({ ...(await importOriginal<object>()), adminLocale: () => "uz" }));
vi.mock("@/lib/admin/queries", () => ({
  listProducts: vi.fn(async () => [{ id: "p-a", slug: "a", name: "Omega", price: 100, oldPrice: null, inStock: true, stockQty: 3, kind: "core", categorySlug: "c", brandSlug: null }]),
}));
vi.mock("@/app/admin/_actions/promocodes", () => ({ savePromoCode: vi.fn(), togglePromoCode: vi.fn() }));
vi.mock("@/app/admin/_actions/catalog", () => ({ saveProduct: vi.fn() }));
vi.mock("@/app/admin/_actions/orders", () => ({ setOrderStatus: vi.fn() }));

const usage = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
const reply = (content: unknown[], stop_reason: string) => ({ content, stop_reason, usage });

const owner = { id: 1, email: "o@x", name: "O", role: "owner" as const, twoFactor: true };
const operator = { ...owner, role: "operator" as const };

describe("runAgent", async () => {
  const { runAgent } = await import("./agent");
  beforeEach(() => create.mockReset());

  it("runs a read tool and answers", async () => {
    create
      .mockResolvedValueOnce(reply([{ type: "tool_use", id: "t1", name: "search_products", input: { query: "omega" } }], "tool_use"))
      .mockResolvedValueOnce(reply([{ type: "text", text: "Omega bor, 3 dona." }], "end_turn"));
    const r = await runAgent({ apiKey: "k", model: "claude-haiku-5-5", admin: owner, messages: [{ role: "user", content: "omega bormi" }] });
    expect(r.pending).toBeNull();
    expect(create).toHaveBeenCalledTimes(2);
    const toolResult = (r.messages[2].content as { type: string; content: string }[])[0];
    expect(toolResult.type).toBe("tool_result");
    expect(JSON.parse(toolResult.content).products[0].name).toBe("Omega");
    expect(r.usage.input).toBe(20);
  });

  it("stops on a write call and shows what will change", async () => {
    create.mockResolvedValueOnce(reply([{ type: "tool_use", id: "t2", name: "create_promocode", input: { kind: "percent", value: 15 } }], "tool_use"));
    const r = await runAgent({ apiKey: "k", model: "claude-haiku-5-5", admin: owner, messages: [{ role: "user", content: "15% promokod" }] });
    expect(create).toHaveBeenCalledTimes(1);
    expect(r.pending?.name).toBe("create_promocode");
    expect(r.pending?.preview).toContainEqual(["Chegirma", "15%"]);
  });

  it("gives an operator no catalogue or marketing tools", async () => {
    create.mockResolvedValueOnce(reply([{ type: "text", text: "ok" }], "end_turn"));
    await runAgent({ apiKey: "k", model: "claude-haiku-5-5", admin: operator, messages: [{ role: "user", content: "salom" }] });
    const names = (create.mock.calls[0][0].tools as { name: string }[]).map((t) => t.name);
    expect(names).toContain("list_orders");
    expect(names).not.toContain("create_promocode");
    expect(names).not.toContain("create_product");
  });

  it("refuses a tool outside the role even if the model asks for it", async () => {
    create
      .mockResolvedValueOnce(reply([{ type: "tool_use", id: "t3", name: "create_promocode", input: { kind: "percent", value: 15 } }], "tool_use"))
      .mockResolvedValueOnce(reply([{ type: "text", text: "Ruxsat yoʻq." }], "end_turn"));
    const r = await runAgent({ apiKey: "k", model: "claude-haiku-5-5", admin: operator, messages: [{ role: "user", content: "promokod" }] });
    expect(r.pending).toBeNull();
    expect((r.messages[2].content as { is_error?: boolean }[])[0].is_error).toBe(true);
  });
});
