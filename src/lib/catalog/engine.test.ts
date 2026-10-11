import { describe, expect, it } from "vitest";
import { CatalogEngine } from "./engine";
import { builtInCatalog } from "@/lib/shopflow/mock";

const base = builtInCatalog.products.find((p) => p.oldPrice)!;

function engineWith(saleEndsAt: string) {
  return new CatalogEngine(async () => ({
    ...builtInCatalog,
    products: [{ ...base, saleEndsAt }],
  }));
}

describe("sale end date", () => {
  it("keeps the sale and its countdown before the end", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const p = await engineWith(future).getProduct(base.slug, "uz");
    expect(p).toMatchObject({ price: base.price, oldPrice: base.oldPrice, saleEndsAt: future });
  });

  it("returns to the old price once the end has passed", async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const p = await engineWith(past).getProduct(base.slug, "uz");
    expect(p?.price).toBe(base.oldPrice);
    expect(p?.oldPrice).toBeUndefined();
    expect(p?.saleEndsAt).toBeUndefined();
  });
});
