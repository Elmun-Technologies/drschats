import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import type { Product } from "@/lib/shopflow/types";
import { getIngredients } from "@/lib/content/ingredients.sanity";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import { reviewerForKey } from "@/lib/content/experts.sanity";
import type { Expert } from "@/lib/content/experts.sanity";
import { getHealthTopic, getHealthTopics } from "@/lib/content/health-topics.sanity";
import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";

const PRODUCT_POOL_SIZE = 100;

export interface HealthTopicPageData {
  topic: HealthTopic;
  products: Product[];
  ingredients: Ingredient[];
  related: HealthTopic[];
  /** Null while the review board is empty — see content/experts.ts. */
  reviewer: Expert | null;
}

/**
 * The products pinned to a topic, in the order the editor listed them.
 *
 * Categories used to fill the rest of the rail, but a category is far wider
 * than a topic: "vitamins" put a B-complex on the digestion page and a men's
 * formula on the immunity page. A topic shows what was chosen for it, or
 * nothing.
 */
function selectProducts(topic: HealthTopic, pool: Product[]): Product[] {
  return topic.productSlugs
    .map((slug) => pool.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export async function loadHealthTopicPage(
  slug: string,
  locale: Locale,
  kind: HealthTopicKind,
): Promise<HealthTopicPageData | null> {
  const topic = await getHealthTopic(slug, locale);
  if (!topic || topic.kind !== kind) return null;

  const [pool, allIngredients, allTopics, reviewer] = await Promise.all([
    shopflow.getProducts({ locale, pageSize: PRODUCT_POOL_SIZE }),
    getIngredients(locale),
    getHealthTopics(locale),
    reviewerForKey(topic.slug, locale),
  ]);

  const wanted = new Set(topic.ingredientSlugs);
  const relatedSlugs = new Set(topic.relatedSlugs);

  return {
    topic,
    products: selectProducts(topic, pool.items),
    ingredients: allIngredients.filter((i) => wanted.has(i.slug)),
    related: allTopics.filter((t) => t.slug !== topic.slug && relatedSlugs.has(t.slug)),
    reviewer,
  };
}
