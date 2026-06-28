import type { Product } from "@/lib/shopflow/types";
import type { UserProfile } from "./types";
import { getCategoryAffinities, getTypicalPrice } from "./tracker";

/**
 * Score a product for a given user profile. Higher = more relevant.
 * Pure function — no side effects, no DOM access.
 */
export function scoreProduct(
  product: Product,
  affinities: Record<string, number>,
  typicalPrice: number,
  seenSlugs: Set<string>,
  purchasedSlugs: Set<string>,
): number {
  let score = 0;

  // Base quality signal
  score += (product.rating / 5) * 1.5;

  // Category affinity (0–4 range)
  const affinity = affinities[product.categorySlug] ?? 0;
  score += affinity * 4;

  // Price proximity — boost if within 40% of user's typical price
  if (typicalPrice > 0) {
    const ratio = Math.abs(product.price - typicalPrice) / typicalPrice;
    if (ratio <= 0.4) score += (1 - ratio) * 2;
  }

  // Novelty — penalize already-seen products
  if (seenSlugs.has(product.slug)) score -= 3;

  // Don't resurface purchased items
  if (purchasedSlugs.has(product.slug)) score -= 5;

  // Slight boost for in-stock
  if (!product.inStock) score -= 1;

  return score;
}

/**
 * Return up to `limit` personalized product recommendations for the given profile.
 * excludeSlugs are always excluded (e.g., current product or cart items).
 */
export function getRecommendations(
  products: Product[],
  profile: UserProfile,
  excludeSlugs: string[] = [],
  limit = 8,
): Product[] {
  const affinities = getCategoryAffinities(profile);
  const typicalPrice = getTypicalPrice(profile);
  const seenSlugs = new Set(profile.views.map((v) => v.slug));
  const purchasedSlugs = new Set(profile.purchases);
  const excludeSet = new Set(excludeSlugs);

  return products
    .filter((p) => !excludeSet.has(p.slug))
    .map((p) => ({
      product: p,
      score: scoreProduct(p, affinities, typicalPrice, seenSlugs, purchasedSlugs),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
}

/**
 * Return products similar to `current` using content-based filtering.
 * Scores by: same category, same origin, similar price range.
 */
export function getSimilarProducts(
  current: Product,
  allProducts: Product[],
  limit = 6,
): Product[] {
  return allProducts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0;

      if (p.categorySlug === current.categorySlug) score += 4;
      if (p.origin && current.origin && p.origin === current.origin) score += 2;

      const priceDiff = Math.abs(p.price - current.price) / (current.price || 1);
      if (priceDiff <= 0.3) score += 1;

      // Small rating boost for quality signal
      score += (p.rating / 5) * 0.5;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
}
