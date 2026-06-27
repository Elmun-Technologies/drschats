import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n/routing";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";

export interface BespokeProps {
  product: Product;
  upsells: UpsellOffer[];
  locale: Locale;
}

/**
 * Bespoke (cinematic, dark-era) product pages are parked while the site uses
 * the unified light minimal template. The components remain under
 * src/components/bespoke/* and can be re-enabled here once re-themed to the
 * light palette — just add `"<slug>": Component` back to this map.
 */
export const bespokeRegistry: Record<string, ComponentType<BespokeProps>> = {};

export function getBespokeComponent(slug: string): ComponentType<BespokeProps> | null {
  return bespokeRegistry[slug] ?? null;
}
