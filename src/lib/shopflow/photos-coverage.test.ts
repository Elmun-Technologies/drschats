import { describe, expect, it } from "vitest";
import { listAllSlugs } from "./mock";
import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";

describe("product photos", () => {
  it("every catalogue product has its own real photos", () => {
    const missing = listAllSlugs().map((p) => p.slug).filter((slug) => !PRODUCT_PHOTOS[slug]?.length);
    expect(missing).toEqual([]);
  });
});
