import type { Product } from "@/lib/shopflow/types";

export function discountPercent(product: Product): number {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

/*
  Discounted products, deepest cut first.

  Out-of-stock items are dropped rather than shown greyed out: the whole point
  of a discount rail is that every card in it can be bought right now, and a
  home page that leads with an unbuyable bargain teaches people to distrust the
  rest of the prices.
*/
export function byDeepestDiscount(products: Product[], limit?: number): Product[] {
  const discounted = products
    .filter((p) => p.inStock && discountPercent(p) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a));

  return limit == null ? discounted : discounted.slice(0, limit);
}
