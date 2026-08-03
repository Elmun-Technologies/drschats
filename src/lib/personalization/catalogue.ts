import type { Product } from "@/lib/shopflow/types";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import type { HealthTopic } from "@/lib/content/health-topics";

/*
  Scoring the catalogue against health signals.

  Shared by the quiz (signals derived from answers) and by the saved profile
  (signals the visitor set on /profile). Both need the same guarantee: every
  point a product earns traces back to a named ingredient or health topic, so
  the "why is this here" line under a product is the truth and not a slogan.

  Deliberately not fuzzy text matching. The ingredient guide already knows
  which products contain an ingredient, and each health topic knows its pinned
  products and categories — those two exact sources are the whole engine.
*/

export interface HealthSignals {
  /** topic slug → weight */
  topics: Record<string, number>;
  /** ingredient slug → weight */
  ingredients: Record<string, number>;
}

export interface ScoredProduct {
  product: Product;
  score: number;
  /** Human-readable names of the topics and ingredients that earned the score. */
  reasons: string[];
}

const MAX_REASONS = 3;

export function scoreCatalogue(
  pool: Product[],
  allTopics: HealthTopic[],
  allIngredients: Ingredient[],
  signals: HealthSignals,
): ScoredProduct[] {
  const scores = new Map<string, number>();
  const reasons = new Map<string, Set<string>>();

  const credit = (slug: string, weight: number, reason: string) => {
    scores.set(slug, (scores.get(slug) ?? 0) + weight);
    if (!reasons.has(slug)) reasons.set(slug, new Set());
    reasons.get(slug)!.add(reason);
  };

  for (const ingredient of allIngredients) {
    const weight = signals.ingredients[ingredient.slug] ?? 0;
    if (weight <= 0) continue;
    for (const productSlug of ingredient.inProducts) {
      credit(productSlug, weight * 2, ingredient.name);
    }
  }

  for (const topic of allTopics) {
    const weight = signals.topics[topic.slug] ?? 0;
    if (weight <= 0) continue;
    for (const productSlug of topic.productSlugs) {
      credit(productSlug, weight * 2, topic.name);
    }
    if (topic.categorySlugs.length > 0) {
      for (const product of pool) {
        if (product.categorySlug && topic.categorySlugs.includes(product.categorySlug)) {
          credit(product.slug, weight, topic.name);
        }
      }
    }
  }

  return pool
    .map((product) => {
      const base = scores.get(product.slug) ?? 0;
      if (base <= 0) return null;
      // Quality and availability break ties between equally relevant products.
      const score = base + (product.rating / 5) * 0.8 - (product.inStock ? 0 : 2);
      return {
        product,
        score,
        reasons: [...(reasons.get(product.slug) ?? [])].slice(0, MAX_REASONS),
      };
    })
    .filter((entry): entry is ScoredProduct => entry !== null)
    .sort((a, b) => b.score - a.score);
}

/**
 * Turn a ranked list of slugs into weights.
 *
 * The saved profile keeps goals in priority order but carries no numbers, so
 * position becomes the weight: first choice counts most, and everything past
 * the list is zero.
 */
export function weightsFromRanking(slugs: string[]): Record<string, number> {
  const weights: Record<string, number> = {};
  slugs.forEach((slug, index) => {
    weights[slug] = Math.max(1, slugs.length - index);
  });
  return weights;
}
