import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "@/lib/cart/pricing";
import { buildUpsellLadder, relevantTo } from "./ladder";

function product(slug: string, categorySlug: string, price: number): Product {
  return {
    id: slug,
    slug,
    name: slug,
    categoryId: `cat-${categorySlug}`,
    categorySlug,
    price,
    rating: 0,
    reviewCount: 0,
    inStock: true,
    images: [],
  } as unknown as Product;
}

const calcivit = product("swiss-energy-calcivit-30", "minerals", 276_000);
const coffee = product("swiss-energy-coffee-edel-250g", "coffee", 171_000);
const tonometer = product("dr-frei-tonometr-a20", "devices", 253_000);
const kids = product("dr-frei-kids-multivitamins-20", "kids", 66_000);
const prenatal = product("swiss-energy-prenatal-forte-60", "vitamins", 470_000);
const magnesium = product("dr-frei-antistress-magniy-20", "effervescent", 66_000);
const immunovit = product("swiss-energy-immunovit-30", "immunity", 276_000);
const vitaminC = product("swiss-energy-vitamin-c-20", "effervescent", 66_000);

const line = (p: Product): CartLine => ({ lineId: p.id, productId: p.id, slug: p.slug, name: p.name, image: "", price: p.price, quantity: 1 });

describe("upsell relevance", () => {
  it("never offers coffee, a device or a children's product next to a vitamin", () => {
    expect(relevantTo(coffee, [calcivit])).toBe(false);
    expect(relevantTo(tonometer, [calcivit])).toBe(false);
    expect(relevantTo(kids, [calcivit])).toBe(false);
    expect(relevantTo(prenatal, [calcivit])).toBe(false);
    expect(relevantTo(magnesium, [calcivit])).toBe(true);
  });

  it("keeps an offer within what the cart already holds", () => {
    expect(relevantTo(coffee, [product("swiss-energy-coffee-crema-500g", "coffee", 300_000)])).toBe(true);
    expect(relevantTo(kids, [product("dr-frei-thermometer-t30", "kids", 64_000)])).toBe(true);
    expect(relevantTo(magnesium, [coffee])).toBe(true);
  });

  it("builds the ladder from relevant products only", () => {
    const pool = [calcivit, coffee, tonometer, kids, prenatal, magnesium, immunovit, vitaminC];
    const steps = buildUpsellLadder([line(calcivit)], pool);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    const offered = steps.map((s) => s.product.slug);
    expect(offered).not.toContain(coffee.slug);
    expect(offered).not.toContain(tonometer.slug);
    expect(offered).not.toContain(kids.slug);
    expect(offered).not.toContain(prenatal.slug);
  });

  it("offers nothing rather than something irrelevant", () => {
    expect(buildUpsellLadder([line(calcivit)], [calcivit, coffee, tonometer, kids])).toEqual([]);
  });
});

describe("«Savatga qoʻshildi» suggestions", () => {
  it("keeps a supplement's neighbours to supplements", async () => {
    const { getSimilarProducts } = await import("@/lib/personalization/engine");
    const pool = [immunovit, coffee, product("swiss-energy-coffee-crema-500g", "coffee", 315_000), tonometer, magnesium, vitaminC];
    const similar = getSimilarProducts(immunovit, pool).map((p) => p.slug);
    expect(similar).toEqual(expect.arrayContaining([magnesium.slug, vitaminC.slug]));
    expect(similar.some((s) => s.includes("coffee"))).toBe(false);
    expect(similar).not.toContain(tonometer.slug);
  });
});
