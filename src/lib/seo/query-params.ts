import type { RawSearchParams } from "@/lib/search-params";

/*
  Which query parameters make a listing URL a different page.

  The catalogue, category and brand pages used to set noindex on any query
  string at all, so an ad click (`?utm_source=…`, `?gclid=…`) or a partner
  link (`?ref=…`) turned the clean, canonical shelf into a noindex page for
  whichever crawler followed that link. Only parameters the page actually
  reads change what is shown; everything else is the same page, and the
  canonical already points at the clean URL.
*/

/** What ShopView reads on /products and /products/[category]: sort, search, page and the filter panel. */
export const CATALOG_VARIANT_PARAMS = [
  "sort", "q", "page",
  "stock", "sale", "ending", "brand", "form", "origin", "goal", "min", "max",
] as const;

/** The brand page's only switch: the dose-form chip. */
export const BRAND_VARIANT_PARAMS = ["form"] as const;

/** Ad, analytics and referral markers: they say where a visitor came from, not what the page shows. */
export const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
  "gclid", "gbraid", "wbraid", "yclid", "ysclid", "fbclid", "ttclid", "msclkid", "srsltid",
  "_openstat", "ref",
] as const;

export function isTrackingParam(key: string): boolean {
  const k = key.toLowerCase();
  return k.startsWith("utm_") || (TRACKING_PARAMS as readonly string[]).includes(k);
}

/** True when the query selects a sorted, filtered, searched or paged variant of the page. */
export function isVariantQuery(query: RawSearchParams, variantParams: readonly string[]): boolean {
  return Object.entries(query).some(([key, value]) => {
    if (isTrackingParam(key) || !variantParams.includes(key)) return false;
    const values = Array.isArray(value) ? value : [value];
    return values.some((v) => v != null && v.trim() !== "");
  });
}
