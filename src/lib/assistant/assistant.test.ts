import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/admin/roles";
import { DEFAULT_ASSISTANT_MODEL, assistantModelOf, usageCostUsd } from "./config";
import { TOOL_LABELS } from "./labels";
import { chatView, userTurns } from "./view";

// The tools module pulls the panel's server actions in; their Next runtime is not needed to read the table.
vi.mock("@/app/admin/_actions/promocodes", () => ({ savePromoCode: vi.fn(), togglePromoCode: vi.fn() }));
vi.mock("@/app/admin/_actions/catalog", () => ({ saveProduct: vi.fn() }));
vi.mock("@/app/admin/_actions/orders", () => ({ setOrderStatus: vi.fn() }));

describe("assistant model", () => {
  it("runs on Haiku unless a known model is chosen", () => {
    expect(DEFAULT_ASSISTANT_MODEL).toBe("claude-haiku-5-5");
    expect(assistantModelOf("")).toBe("claude-haiku-5-5");
    expect(assistantModelOf("gpt-4")).toBe("claude-haiku-5-5");
    expect(assistantModelOf("claude-sonnet-5-5")).toBe("claude-sonnet-5-5");
  });

  it("prices cache reads at a tenth of input", () => {
    const fresh = usageCostUsd("claude-haiku-5-5", { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0 });
    const cached = usageCostUsd("claude-haiku-5-5", { input: 0, output: 0, cacheRead: 1_000_000, cacheWrite: 0 });
    expect(fresh).toBeCloseTo(0.1);
    expect(cached).toBeCloseTo(0.01);
  });
});

describe("assistant tools", async () => {
  const { TOOLS, parseToolInput } = await import("./tools");

  it("have unique names, a label for the chat and a real permission", () => {
    const names = TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const t of TOOLS) {
      expect(TOOL_LABELS[t.name], t.name).toBeTruthy();
      expect(PERMISSIONS).toContain(t.permission);
    }
  });

  it("never write without showing the admin what changes", () => {
    for (const t of TOOLS.filter((x) => x.write)) expect(t.preview, t.name).toBeTypeOf("function");
  });

  it("describe their input as a JSON object schema", () => {
    for (const t of TOOLS) {
      const schema = z.toJSONSchema(t.schema, { io: "input" }) as { type?: string };
      expect(schema.type, t.name).toBe("object");
    }
  });

  it("reject input outside the schema before anything runs", () => {
    const promo = TOOLS.find((t) => t.name === "create_promocode")!;
    expect(parseToolInput(promo, { kind: "percent", value: 15 }).ok).toBe(true);
    expect(parseToolInput(promo, { kind: "percent", value: -5 }).ok).toBe(false);
    expect(parseToolInput(promo, { kind: "gift", value: 5 }).ok).toBe(false);
    const status = TOOLS.find((t) => t.name === "set_order_status")!;
    expect(parseToolInput(status, { number: "1001", status: "lost" }).ok).toBe(false);
  });
});

describe("chat view", () => {
  const history = [
    { role: "user", content: [{ type: "image", source: {} }, { type: "text", text: "Buni qoʻsh\n[Rasm URL: https://x/y.jpg]" }] },
    { role: "assistant", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "Qoʻshaman." }, { type: "tool_use", id: "t1", name: "create_product", input: {} }] },
    { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", is_error: true, content: "x" }] },
    { role: "assistant", content: [{ type: "text", text: "Xato boʻldi." }] },
  ];

  it("shows what the admin typed, not the lines added for the model", () => {
    expect(chatView(history)[0]).toEqual({ kind: "user", text: "Buni qoʻsh", images: 1 });
  });

  it("shows tools by name, marks a failed one, and hides thinking and results", () => {
    expect(chatView(history).slice(1)).toEqual([
      { kind: "assistant", text: "Qoʻshaman." },
      { kind: "tool", name: "create_product", error: true },
      { kind: "assistant", text: "Xato boʻldi." },
    ]);
  });

  it("counts typed messages, not tool results", () => {
    expect(userTurns(history)).toBe(1);
  });
});
