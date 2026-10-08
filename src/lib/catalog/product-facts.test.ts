import { describe, expect, it } from "vitest";
import { brandOf, cutoutOf, unitOf } from "./product-facts";

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
