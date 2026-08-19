"use server";

import { z } from "zod";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { shopflow } from "@/lib/shopflow";
import { getIngredients } from "@/lib/content/ingredients.sanity";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { scoreCatalogue, weightsFromRanking } from "@/lib/personalization/catalogue";

/*
  The saved profile lives in the browser, the catalogue lives on the server.

  Rather than ship the whole catalogue plus the ingredient and topic guides to
  every visitor so the browser can do the matching, the browser sends the few
  slugs it knows and gets back finished offers. Nothing identifying crosses the
  wire: goal slugs, not a name, an email or a birthday.
*/

const POOL_SIZE = 60;
const MAX_OFFERS = 8;

const signalsSchema = z.object({
  goals: z.array(z.string().max(64)).max(12),
  ingredients: z.array(z.string().max(64)).max(12),
  excludeSlugs: z.array(z.string().max(160)).max(50).optional(),
});

export interface PersonalOffer {
  product: Product;
  /** Why this product is here — topic and ingredient names, already localised. */
  reasons: string[];
}

export async function getPersonalOffers(
  input: z.input<typeof signalsSchema>,
  locale: Locale,
): Promise<PersonalOffer[]> {
  const parsed = signalsSchema.safeParse(input);
  if (!parsed.success) return [];

  const { goals, ingredients, excludeSlugs = [] } = parsed.data;
  if (goals.length === 0 && ingredients.length === 0) return [];

  const [pool, allIngredients, allTopics] = await Promise.all([
    shopflow.getProducts({ locale, pageSize: POOL_SIZE }),
    getIngredients(locale),
    getHealthTopics(locale),
  ]);

  const exclude = new Set(excludeSlugs);

  return scoreCatalogue(
    pool.items.filter((p) => !exclude.has(p.slug)),
    allTopics,
    allIngredients,
    { topics: weightsFromRanking(goals), ingredients: weightsFromRanking(ingredients) },
  )
    .slice(0, MAX_OFFERS)
    .map(({ product, reasons }) => ({ product, reasons }));
}
