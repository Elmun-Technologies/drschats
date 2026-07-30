import type { Article } from "@/lib/content/blog.sanity";

/*
  Knowledge Center taxonomy.

  The blog already carried a free-text `category` label, which is fine for a
  badge but useless as a URL: it is localised, editable and cannot be linked
  to. `categoryKey` is the stable slug behind it — the label still comes from
  translations, so renaming a category never changes its address.

  Articles without a key keep working; they simply do not appear under a
  category listing.
*/

export const BLOG_CATEGORY_KEYS = [
  "nutrition",
  "vitamins",
  "lifestyle",
  "science",
  "research",
  "kids",
  "pregnancy",
  "sports",
] as const;

export type BlogCategoryKey = (typeof BLOG_CATEGORY_KEYS)[number];

export function isBlogCategoryKey(value: string): value is BlogCategoryKey {
  return (BLOG_CATEGORY_KEYS as readonly string[]).includes(value);
}

export function articlesInCategory(articles: Article[], key: BlogCategoryKey): Article[] {
  return articles.filter((article) => article.categoryKey === key);
}

/** Only categories that actually have articles — empty chips are dead ends. */
export function usedCategoryKeys(articles: Article[]): BlogCategoryKey[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    if (article.categoryKey) {
      counts.set(article.categoryKey, (counts.get(article.categoryKey) ?? 0) + 1);
    }
  }
  return BLOG_CATEGORY_KEYS.filter((key) => (counts.get(key) ?? 0) > 0);
}
