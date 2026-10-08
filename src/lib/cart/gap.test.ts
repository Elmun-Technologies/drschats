import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "./pricing";
import { gapFillers } from "./gap";

const p = (id: string, price: number, inStock = true) => ({ id, slug: id, price, inStock }) as unknown as Product;
const line = (productId: string) => ({ productId }) as CartLine;

describe("gapFillers", () => {
  const pool = [p("a", 60_000), p("b", 45_000), p("c", 30_000), p("d", 250_000), p("e", 50_000, false), p("f", 55_000)];

  it("offers in-stock products that close the gap alone, cheapest first", () => {
    expect(gapFillers(pool, [line("f")], 40_000).map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("stays quiet when the gap is closed or too wide", () => {
    expect(gapFillers(pool, [], 0)).toEqual([]);
    expect(gapFillers(pool, [], 200_000)).toEqual([]);
  });
});
