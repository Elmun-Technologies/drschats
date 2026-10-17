import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "./pricing";
import { DEFAULT_COMMERCE_SETTINGS } from "@/lib/commerce/settings";

/** Default for how far from free shipping the cart has to be for the suggestions to show (admin: Savdo qoidalari). */
export const GAP_WINDOW = DEFAULT_COMMERCE_SETTINGS.cart.gapWindow;

/*
  Products that close the gap to free shipping on their own: priced at or
  above what is missing, so one tap unlocks it, and not much above it, so the
  suggestion is a small step rather than a second order. Cheapest first.
  `window` is the admin's threshold; 0 switches the suggestions off.
*/
export function gapFillers(
  products: Product[],
  lines: CartLine[],
  remaining: number,
  { limit = 3, window = GAP_WINDOW }: { limit?: number; window?: number } = {},
): Product[] {
  if (remaining <= 0 || remaining > window) return [];
  const inCart = new Set(lines.map((l) => l.productId));
  return products
    .filter((p) => p.inStock && !inCart.has(p.id) && p.price >= remaining && p.price <= remaining + 100_000)
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}
