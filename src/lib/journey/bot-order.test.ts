import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockSelect = vi.fn(() => []);
const mockInsert = vi.fn(() => ({ values: () => Promise.resolve() }));
const mockUpdate = vi.fn(() => ({ set: () => ({ where: () => Promise.resolve() }) }));
vi.mock("@/lib/db/client", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
    insert: () => ({
      values: () => Promise.resolve({}),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve({}),
      }),
    }),
    execute: vi.fn(),
  }),
  isDbConfigured: true,
}));

describe("linkBotOrderToVisitor", () => {
  it("ignores invalid phone", async () => {
    const { linkBotOrderToVisitor } = await import("./collect");
    await expect(
      linkBotOrderToVisitor({
        number: "GV-000124",
        total: 1000,
        phone: "invalid",
        name: "Test",
        items: [],
      }),
    ).resolves.toBeUndefined();
  });

  it("links bot orders via phone9 without throwing", async () => {
    const { linkBotOrderToVisitor } = await import("./collect");
    await expect(
      linkBotOrderToVisitor({
        number: "GV-000123",
        total: 158000,
        phone: "+998901234567",
        name: "Ali Valiyev",
        items: [{ slug: "swiss-energy-immunovit-30" }],
      }),
    ).resolves.toBeUndefined();
  });
});
