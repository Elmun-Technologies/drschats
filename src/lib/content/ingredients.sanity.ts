/**
 * Sanity-backed ingredients content layer.
 * Falls back to static data when NEXT_PUBLIC_SANITY_PROJECT_ID is not set.
 */

import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import { allIngredientsQuery, allSynergyQuery } from "@/sanity/queries/ingredients";

export interface Ingredient {
  slug: string;
  name: string;
  role: string;
  description: string;
  inProducts: string[];
}

export interface SynergyPair {
  type: "boost" | "block";
  a: string;
  b: string;
  note: string;
}

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export async function getIngredients(locale: Locale): Promise<Ingredient[]> {
  if (!isSanityConfigured()) {
    const { getIngredients: getStatic } = await import("./ingredients");
    return getStatic(locale);
  }
  const raw = await client.fetch(allIngredientsQuery, { locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return (raw ?? []).sort((a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name, locale));
}

export async function getSynergy(locale: Locale): Promise<SynergyPair[]> {
  if (!isSanityConfigured()) {
    const { getSynergy: getStatic } = await import("./ingredients");
    return getStatic(locale);
  }
  const raw = await client.fetch(allSynergyQuery, { locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return raw ?? [];
}
