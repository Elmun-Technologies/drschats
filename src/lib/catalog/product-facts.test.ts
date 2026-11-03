import { describe, expect, it } from "vitest";
import { brandOf, cutoutOf, dailyPriceOf, unitOf } from "./product-facts";

const slug = "swiss-energy-visiovit-30";

describe("product facts", () => {
  it("falls back to the slug tables when the source says nothing (built-in catalogue)", () => {
    expect(brandOf({ slug })?.slug).toBe("swiss-energy");
    expect(cutoutOf({ slug })).toBeTruthy();
    expect(unitOf({ slug })?.count).toBe(30);
  });

  it("keeps an explicit null from the database as none", () => {
    expect(brandOf({ slug, brand: null })).toBeNull();
    expect(cutoutOf({ slug, cutout: null })).toBeUndefined();
    expect(unitOf({ slug, unit: null })).toBeNull();
  });

  it("prefers the product's own value", () => {
    expect(brandOf({ slug, brand: { slug: "x", name: "X" } })?.slug).toBe("x");
    expect(cutoutOf({ slug, cutout: "/a.png" })).toBe("/a.png");
  });
});

describe("search folding", async () => {
  const { fold } = await import("@/lib/search/fold");
  it("treats every Uzbek apostrophe form the same", () => {
    expect(fold("Goʻzallik")).toBe(fold("Go'zallik"));
    expect(fold("BOʻGʻIMLAR")).toBe("bo'g'imlar");
  });
});

describe("daily price", () => {
  it("is the unit price only where the label says one a day", () => {
    expect(dailyPriceOf({ slug: "swiss-energy-immunovit-30", price: 276_000 })).toBe(9_200);
    expect(dailyPriceOf({ slug: "dr-frei-multivitamins-biotin-20", price: 66_000 })).toBe(3_300);
  });

  it("is absent where the dose is left to the label or a doctor", () => {
    expect(dailyPriceOf({ slug: "swiss-energy-calcivit-30", price: 276_000 })).toBeNull();
    expect(dailyPriceOf({ slug: "swiss-energy-prenatal-forte-60", price: 470_000 })).toBeNull();
    expect(dailyPriceOf({ slug: "dr-frei-tonometr-a20", price: 253_000 })).toBeNull();
  });
});
