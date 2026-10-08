import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_CUTOUTS } from "./product-cutouts";
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
