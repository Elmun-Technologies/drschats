import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_CUTOUTS, categoryCutout } from "./product-cutouts";
import { PRODUCT_PHOTOS } from "./product-photos";

describe("PRODUCT_CUTOUTS", () => {
  it.each(Object.entries(PRODUCT_CUTOUTS))("%s points at a file in public/", (_slug, src) => {
    expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
  });

  it("only names products the catalogue already knows", () => {
    const unknown = Object.keys(PRODUCT_CUTOUTS).filter((slug) => !(slug in PRODUCT_PHOTOS));
    expect(unknown).toEqual([]);
  });
});

describe("categoryCutout", () => {
  it.each(["vitamins", "minerals", "immunity", "beauty", "kids", "effervescent", "clinical-nutrition", "skin", "devices", "collagen"])(
    "%s resolves to a cutout",
    (slug) => {
      expect(categoryCutout(slug)).toMatch(/^\/images\/products\/c-.+\.png$/);
    },
  );

  it("returns nothing for a category without one", () => {
    expect(categoryCutout("coffee")).toBeUndefined();
  });
});
