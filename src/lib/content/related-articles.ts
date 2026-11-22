interface Linkable {
  slug: string;
  date: string;
  categoryKey?: string;
  relatedProductSlugs: string[];
  relatedArticleSlugs?: string[];
}

/**
 * "Read next" by topic, not by list order: the share of products two articles
 * have in common is the strongest signal (same product, same shopper), then
 * the same category, then the newer date. Editorial picks
 * (`relatedArticleSlugs`) always come first.
 */
export function relatedArticles<T extends Linkable>(current: Linkable, all: readonly T[], limit = 2): T[] {
  const products = new Set(current.relatedProductSlugs);
  const score = (a: Linkable) => {
    const shared = a.relatedProductSlugs.filter((slug) => products.has(slug)).length;
    const union = new Set([...products, ...a.relatedProductSlugs]).size;
    return (union ? shared / union : 0) * 3 + (current.categoryKey && a.categoryKey === current.categoryKey ? 0.5 : 0);
  };
  const picked = (current.relatedArticleSlugs ?? [])
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is T => !!a && a.slug !== current.slug);
  const rest = all
    .filter((a) => a.slug !== current.slug && !picked.includes(a))
    .map((article) => ({ article, score: score(article) }))
    .sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date))
    .map(({ article }) => article);
  return [...picked, ...rest].slice(0, limit);
}
