import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "./pricing";

/** How far from free shipping the cart has to be for the suggestions to show. */
export const GAP_WINDOW = 150_000;

/*
  Products that close the gap to free shipping on their own: priced at or
  above what is missing, so one tap unlocks it, and not much above it, so the
  suggestion is a small step rather than a second order. Cheapest first.
*/
export function gapFillers(products: Product[], lines: CartLine[], remaining: number, limit = 3): Product[] {
  if (remaining <= 0 || remaining > GAP_WINDOW) return [];
  const inCart = new Set(lines.map((l) => l.productId));
  return products
    .filter((p) => p.inStock && !inCart.has(p.id) && p.price >= remaining && p.price <= remaining + 100_000)
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}
