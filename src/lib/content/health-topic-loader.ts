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
  reviewer: Expert;
}

/**
 * Products explicitly pinned to a topic win; otherwise the topic's categories
 * decide. Both are unioned so an editor can pin a hero product and still let
 * the category fill the rest of the rail.
 */
function selectProducts(topic: HealthTopic, pool: Product[]): Product[] {
  const pinned = new Set(topic.productSlugs);
  const categories = new Set(topic.categorySlugs);

  const matches = pool.filter(
    (p) => pinned.has(p.slug) || (p.categorySlug ? categories.has(p.categorySlug) : false),
  );

  // Pinned products first, in the order the editor listed them.
  return matches.sort((a, b) => {
    const ai = pinned.has(a.slug) ? topic.productSlugs.indexOf(a.slug) : Number.MAX_SAFE_INTEGER;
    const bi = pinned.has(b.slug) ? topic.productSlugs.indexOf(b.slug) : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
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
