import type { Product } from "@/lib/shopflow/types";
import { productCutout } from "@/lib/content/product-cutouts";
import { ONE_A_DAY, PRODUCT_UNITS, type DoseUnit } from "@/lib/content/product-units";
import { productBrand, type ProductBrand } from "@/lib/content/product-brands";

/*
  One reader for the facts a card, a filter and the structured data need.
  The product's own value wins (admin-managed products), including an explicit
  null — an admin who cleared a brand or cutout means "none". Only an absent
  field (the built-in catalogue) falls back to the slug tables.
*/
type Facts = Pick<Product, "slug"> & Partial<Pick<Product, "cutout" | "unit" | "brand">>;

export function cutoutOf(p: Facts): string | undefined {
  return p.cutout !== undefined ? (p.cutout ?? undefined) : productCutout(p.slug);
}

export function unitOf(p: Facts): { count: number; unit: DoseUnit } | null {
  return p.unit !== undefined ? p.unit : (PRODUCT_UNITS[p.slug] ?? null);
}

export function unitPriceOf(p: Facts & Pick<Product, "price">): { amount: number; unit: DoseUnit } | null {
  const pack = unitOf(p);
  return pack ? { amount: p.price / pack.count, unit: pack.unit } : null;
}

/** The price of one day, only where the label says one dose a day (ONE_A_DAY). */
export function dailyPriceOf(p: Facts & Pick<Product, "price">): number | null {
  const unit = unitPriceOf(p);
  return unit && ONE_A_DAY.has(p.slug) ? unit.amount : null;
}

export function brandOf(p: Facts): ProductBrand | null {
  return p.brand !== undefined ? p.brand : productBrand(p.slug);
}
