import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/shopflow", () => {
  const all = Array.from({ length: 230 }, (_, i) => ({ id: `p${i}` }));
  return {
    shopflow: {
      getProducts: vi.fn(async ({ page = 1, pageSize = 100 }: { page?: number; pageSize?: number }) => ({
        items: all.slice((page - 1) * pageSize, page * pageSize),
        total: all.length,
        page,
        pageSize,
      })),
    },
  };
});

import { getAllProducts } from "./all-products";

describe("getAllProducts", () => {
  it("collects every page up to the total", async () => {
    const result = await getAllProducts({ locale: "uz" });
    expect(result.items).toHaveLength(230);
    expect(result.items.at(-1)).toEqual({ id: "p229" });
  });
});
