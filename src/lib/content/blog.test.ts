import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getArticles, readingMinutes } from "./blog";
import { listAllSlugs } from "@/lib/shopflow/mock";
import { BANNED_CLAIMS } from "./claims";

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

describe("reading time", () => {
  const words = (n: number) => Array.from({ length: n }, () => "soʻz").join(" ");
  const article = (n: number) => ({ excerpt: "", sections: [{ heading: "", paragraphs: [words(n)] }] });

  it("is the word count at ~200 words a minute, never under a minute", () => {
    expect(readingMinutes(article(0))).toBe(1);
    expect(readingMinutes(article(100))).toBe(1);
    expect(readingMinutes(article(400))).toBe(2);
    expect(readingMinutes(article(1000))).toBe(5);
  });

  it("ignores punctuation-only tokens", () => {
    expect(readingMinutes({ excerpt: "— — —", sections: [] })).toBe(1);
  });

  it.each(["uz", "ru"] as const)("%s: shown minutes match the article's own text", (locale) => {
    for (const a of getArticles(locale)) expect(a.readingMinutes, a.slug).toBe(readingMinutes(a));
  });
});

describe("blog copy", () => {
  const texts = (["uz", "ru"] as const).flatMap((locale) =>
    getArticles(locale).flatMap((a) =>
      [a.title, a.excerpt, ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs])].map((text) => [`${locale}:${a.slug}`, text] as const),
    ),
  );

  // «<title> | govita blogi» must fit a result line (70).
  it.each(["uz", "ru"] as const)("%s: titles leave room for the blog suffix", (locale) => {
    for (const a of getArticles(locale)) expect(a.title.length, a.title).toBeLessThanOrEqual(55);
  });

  it("makes no medical promise", () => {
    const hits = texts.flatMap(([where, text]) => BANNED_CLAIMS.filter((re) => re.test(text)).map((re) => `${where}: ${re.source} — ${text}`));
    expect(hits).toEqual([]);
  });

  it("writes Uzbek oʻ/gʻ with U+02BB", () => {
    const hits = texts.filter(([where, text]) => where.startsWith("uz:") && /[og]['‘’]/i.test(text));
    expect(hits).toEqual([]);
  });
});
