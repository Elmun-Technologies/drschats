import { describe, expect, it } from "vitest";
import { rawProducts } from "@/lib/shopflow/mock";
import { contentToForm, formToContent, parseImages, productFieldsSchema } from "./product-form";

function content(p: (typeof rawProducts)[number]) {
  const { name, tagline, description, highlights, benefits, ingredients, howToUse, faq, badges, servings, origin, searchAliases } = p;
  return { name, tagline, description, highlights, benefits, ingredients, howToUse, faq, badges, servings, origin, ...(searchAliases ? { searchAliases } : {}) };
}

describe("product form codec", () => {
  it.each(rawProducts.map((p) => [p.slug, p] as const))("round-trips %s without losing a field", (_slug, p) => {
    expect(formToContent(contentToForm(content(p)))).toEqual(content(p));
  });

  it("keeps only https or root-relative image URLs", () => {
    expect(parseImages("https://a.b/c.jpg\n/products/x.webp\njavascript:alert(1)\nhttp://x\n")).toEqual([
      "https://a.b/c.jpg",
      "/products/x.webp",
    ]);
  });

  it("rejects an old price that is not above the price", () => {
    const base = { slug: "x-1", categorySlug: "vitamins", price: "100", kind: "core", "uz.name": "Xx", "ru.name": "Xx" };
    expect(productFieldsSchema.safeParse({ ...base, oldPrice: "90" }).success).toBe(false);
    expect(productFieldsSchema.safeParse({ ...base, oldPrice: "120" }).success).toBe(true);
    expect(productFieldsSchema.safeParse({ ...base, oldPrice: "" }).success).toBe(true);
    expect(productFieldsSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
  });
});
