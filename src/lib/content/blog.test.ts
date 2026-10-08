import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getArticles } from "./blog";
import { listAllSlugs } from "@/lib/shopflow/mock";

/*
  Articles name their related products by slug. Those slugs once pointed at a
  catalogue that no longer exists, and the "related products" panel silently
  rendered nothing. The panel only works if every slug is a real product.
*/
describe("blog articles", () => {
  const catalogue = new Set(listAllSlugs().map((p) => p.slug));
  const articles = getArticles("uz");

  it.each(articles.map((a) => [a.slug, a] as const))("%s links only to products in the catalogue", (_slug, article) => {
    expect(article.relatedProductSlugs.filter((s) => !catalogue.has(s))).toEqual([]);
  });

  it.each(articles.map((a) => [a.slug, a.image] as const))("%s has an image file in public/", (_slug, src) => {
    expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
  });
});
