import type { Product } from "@/lib/shopflow/types";

/*
  What the promotional surfaces may show.

  The shop stocks three brand lines (Swiss Energy, Dr. Frei, Delical) plus a
  handful of add-ons. The add-ons are real products and stay buyable, but a
  "Deal of the day" rail that opens with a thermometer, or a "best sellers"
  grid half filled with balms, tells a shopper this is a general bazaar rather
  than a supplement shop with a curated range.
*/

/** Products a campaign, rail or deal may lead with. */
export function isCore(product: Product): boolean {
  return (product.assortment ?? "core") === "core";
}

/** Products that may appear in listings at all. */
export function isListed(product: Product): boolean {
  return product.assortment !== "unlisted";
}

export function coreOnly(products: Product[]): Product[] {
  return products.filter(isCore);
}

/**
 * A product may only lead a rail when its photo really is its own. The
 * fabricated/borrowed imagery that used to fill the catalogue was the reason a
 * Vitamin C card could show a Dr. Frei tube; nothing that still carries a
 * placeholder is allowed to be the face of a promotion.
 */
export function hasOwnPhoto(product: Product): boolean {
  return Boolean(product.images[0]?.url);
}

export function promotable(products: Product[]): Product[] {
  return products.filter((p) => isCore(p) && hasOwnPhoto(p));
}
