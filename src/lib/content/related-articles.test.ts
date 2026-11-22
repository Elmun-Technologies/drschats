import { describe, expect, it } from "vitest";
import { getArticles } from "@/lib/content/blog";
import { relatedArticles } from "./related-articles";

const all = getArticles("uz");
const find = (slug: string) => all.find((a) => a.slug === slug)!;

describe("relatedArticles", () => {
  it("links the two magnesium articles to each other", () => {
    const sleep = relatedArticles(find("magniy-va-uyqu"), all);
    const forms = relatedArticles(find("magniy-b6-va-magniy-sitrat-farqi"), all);
    expect(sleep.map((a) => a.slug)).toContain("magniy-b6-va-magniy-sitrat-farqi");
    expect(forms.map((a) => a.slug)).toContain("magniy-va-uyqu");
  });

  it("only names editorial picks that exist", () => {
    const slugs = new Set(all.map((a) => a.slug));
    for (const a of all) for (const s of a.relatedArticleSlugs ?? []) expect(slugs.has(s)).toBe(true);
  });

  it("never returns the article itself and respects the limit", () => {
    for (const article of all) {
      const related = relatedArticles(article, all, 2);
      expect(related.length).toBeLessThanOrEqual(2);
      expect(related.some((a) => a.slug === article.slug)).toBe(false);
    }
  });
});
