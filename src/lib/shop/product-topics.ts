import type { Product } from "@/lib/shopflow/types";
import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";
import { productMatchesTopic } from "@/lib/shop/goal-facets";

/*
  The reverse of the goal facets.

  Topics already declare which products belong to them, which powers the shop
  facets and the topic landing pages. Nothing read that relationship the other
  way, so a visitor who arrived on a magnesium page from a search engine had no
  route into the sleep guide that the same catalogue says magnesium serves —
  the health layer was reachable only from the top of the site.

  Linking both directions also matters for ranking: the topic pages are the SEO
  backbone, and product pages are where the traffic lands.
*/

/** Ordered so the visitor reads intent before symptom before substance. */
const KIND_ORDER: HealthTopicKind[] = ["goal", "symptom", "vitamin"];

export function topicsForProduct(
  product: Product,
  topics: HealthTopic[],
  limit = 6,
): HealthTopic[] {
  // A pinned product is a stronger statement than a category overlap, so those
  // topics come first — a category can match half the catalogue.
  const pinned: HealthTopic[] = [];
  const byCategory: HealthTopic[] = [];

  for (const topic of topics) {
    if (topic.productSlugs.includes(product.slug)) pinned.push(topic);
    else if (productMatchesTopic(product, topic)) byCategory.push(topic);
  }

  const byKind = (a: HealthTopic, b: HealthTopic) =>
    KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);

  return [...pinned.sort(byKind), ...byCategory.sort(byKind)].slice(0, limit);
}
