import type { Product } from "@/lib/shopflow/types";
import type { HealthTopic } from "@/lib/content/health-topics";

/*
  Goal facets for the catalogue.

  The visitor filters by "Sleep" or "Women's health", not by warehouse
  category. Rather than inventing a second taxonomy, a facet *is* a health
  topic: the topic already declares which categories and which pinned products
  belong to it, and an editor who adds a topic gets a shop facet for free.

  A product therefore appears under every facet whose categories it matches —
  which is exactly the "one product lives in 2–3 categories" requirement.
  The catalogue filter (catalog-filters.ts) reads goals through this.
*/

export function productMatchesTopic(product: Product, topic: HealthTopic): boolean {
  if (topic.productSlugs.includes(product.slug)) return true;
  return product.categorySlug != null && topic.categorySlugs.includes(product.categorySlug);
}
