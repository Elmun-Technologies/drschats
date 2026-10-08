/*
  The catalogue's sort orders and their labels. A plain module because both
  the server listing and the client filter sheet read it — a value exported
  from a "use client" file reaches a server component as a reference only.
*/
export type CatalogSort = "popular" | "price_asc" | "price_desc" | "deals" | "new";

export const SORT_ORDER: CatalogSort[] = ["popular", "price_asc", "price_desc", "deals", "new"];

const SORT_KEYS: Record<CatalogSort, string> = {
  popular: "sortPopular",
  price_asc: "v3.sortPriceAsc",
  price_desc: "v3.sortPriceDesc",
  deals: "v3.sortDeals",
  new: "sortNew",
};

/** Key in the `shop` namespace. */
export const sortKey = (s: CatalogSort) => SORT_KEYS[s];

export function isCatalogSort(value: unknown): value is CatalogSort {
  return SORT_ORDER.includes(value as CatalogSort);
}
