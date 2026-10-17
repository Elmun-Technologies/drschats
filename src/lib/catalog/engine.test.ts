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

describe("deal of the day", () => {
  const plain = builtInCatalog.products.find((p) => !p.oldPrice && p.price >= 10_000)!;
  const engine = (startsAt: number, endsAt: number) =>
    new CatalogEngine(async () => ({
      ...builtInCatalog,
      deals: [{ id: 1, productSlug: plain.slug, percent: 20, price: null, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() }],
    }));

  it("prices the product (page, listing and the order action alike) only inside the window", async () => {
    const running = engine(Date.now() - 60_000, Date.now() + 3_600_000);
    const p = await running.getProduct(plain.slug, "uz");
    expect(p?.oldPrice).toBe(plain.price);
    expect(p?.price).toBe(Math.round((plain.price * 0.8) / 100) * 100);
    const listed = (await running.getProducts({ locale: "uz", pageSize: 200, assortment: "all" })).items.find((x) => x.slug === plain.slug);
    expect(listed?.price).toBe(p?.price);

    const upcoming = await engine(Date.now() + 60_000, Date.now() + 3_600_000).getProduct(plain.slug, "uz");
    expect(upcoming).toMatchObject({ price: plain.price, oldPrice: undefined });
  });
});
