import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/lib/shopflow/types";
import { resolveCampaign } from "./campaign";

const product = (over: Partial<Product>): Product =>
  ({
    id: over.slug,
    name: over.slug,
    price: 100_000,
    inStock: true,
    images: [],
    assortment: "core",
    brand: null,
    ...over,
  }) as Product;

const catalogue = [
  product({ slug: "omega-a", categorySlug: "vitamins", brand: { slug: "swiss-energy", name: "Swiss Energy" } }),
  product({ slug: "omega-b", categorySlug: "vitamins", oldPrice: 120_000 }),
  product({ slug: "tonometer", categorySlug: "devices" }),
  product({ slug: "hidden", categorySlug: "vitamins", assortment: "unlisted" }),
];
const categories: Category[] = [
  { id: "1", slug: "vitamins", name: "Vitaminlar", productCount: 2 },
  { id: "2", slug: "empty", name: "Boʻsh", productCount: 0 },
  { id: "3", slug: "devices", name: "Jihozlar" },
];

describe("resolveCampaign", () => {
  it("is null for a slug the catalogue does not know, so the page is a 404", () => {
    expect(resolveCampaign("yoq-kampaniya-xyz", catalogue, categories)).toBeNull();
    expect(resolveCampaign("empty", catalogue, categories)).toBeNull();
  });

  it("maps a shelf, a brand, a product and the sale", () => {
    const shelf = resolveCampaign("vitamins", catalogue, categories);
    expect(shelf?.kind).toBe("category");
    expect(shelf?.products.map((p) => p.slug)).toEqual(["omega-a", "omega-b"]);

    expect(resolveCampaign("swiss-energy", catalogue, categories)).toMatchObject({ kind: "brand", brand: { name: "Swiss Energy" } });

    const single = resolveCampaign("omega-b", catalogue, categories);
    expect(single?.kind).toBe("product");
    expect(single?.products.map((p) => p.slug)).toEqual(["omega-b", "omega-a"]);

    expect(resolveCampaign("sale", catalogue, categories)?.products.map((p) => p.slug)).toEqual(["omega-b"]);
  });

  it("never lands an ad on an unlisted product", () => {
    expect(resolveCampaign("hidden", catalogue, categories)).toBeNull();
  });
});
