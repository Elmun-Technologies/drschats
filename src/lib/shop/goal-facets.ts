import type { Product, ProductListResult } from "@/lib/shopflow/types";
import { discountPercent } from "@/lib/shop/discounts";
import type { HealthTopic } from "@/lib/content/health-topics";

/*
  Goal facets for the catalogue.

  The visitor filters by "Sleep" or "Women's health", not by warehouse
  category. Rather than inventing a second taxonomy, a facet *is* a health
  topic: the topic already declares which categories and which pinned products
  belong to it, and an editor who adds a topic gets a shop facet for free.

  A product therefore appears under every facet whose categories it matches —
  which is exactly the "one product lives in 2–3 categories" requirement.
*/

export interface GoalFacet {
  slug: string;
  name: string;
  count: number;
}

/**
 * Facets are counted against the current pool and empty ones are dropped — a
 * chip that leads to "nothing found" is worse than no chip at all.
 */
export function toGoalFacets(topics: HealthTopic[], pool: Product[]): GoalFacet[] {
  return topics
    .map((topic) => ({
      slug: topic.slug,
      name: topic.name,
      count: pool.filter((product) => productMatchesTopic(product, topic)).length,
    }))
    .filter((facet) => facet.count > 0);
}

export function productMatchesTopic(product: Product, topic: HealthTopic): boolean {
  if (topic.productSlugs.includes(product.slug)) return true;
  return product.categorySlug != null && topic.categorySlugs.includes(product.categorySlug);
}

const SORTERS: Record<string, (a: Product, b: Product) => number> = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  new: () => 0,
  deals: (a, b) => discountPercent(b) - discountPercent(a),
  popular: (a, b) => b.rating - a.rating,
};

/**
 * Shopflow cannot filter by goal, so a goal-filtered listing is paginated in
 * memory over a larger pool. The pool is capped, so very large catalogues
 * would need this pushed into the backend as a real tag filter.
 */
export function paginateByGoal(
  pool: Product[],
  topic: HealthTopic,
  { sort, page, pageSize }: { sort: string; page: number; pageSize: number },
): ProductListResult {
  const matches = pool.filter((p) => productMatchesTopic(p, topic));
  const sorted = [...matches].sort(SORTERS[sort] ?? SORTERS.popular);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  };
}
