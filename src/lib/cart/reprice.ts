import type { OrderRequest, Product, Promotion } from "@/lib/shopflow/types";
import { cartLineId, computeTotals, type CartLine } from "./pricing";

/*
  The order the server is willing to accept.

  The order form sends what the browser believes: unit prices, discounts and a
  total. None of that can be trusted — a cart kept for thirty days carries
  yesterday's prices, and anyone can edit a request. So every line is priced
  again from the catalogue, every offer discount is checked against the offers
  the shop actually makes, and the totals are computed here with the same
  engine the cart uses. What the browser sent is only used to find the
  products.
*/

/** Every discount an offer on the site can carry: ladder steps, rail offers, programs, the free gift. */
const OFFER_PERCENTS = new Set([10, 12, 15, 20, 100]);

export type RepriceResult =
  | { ok: true; order: OrderRequest }
  | { ok: false; error: "unknown_product" | "out_of_stock" | "invalid_offer" };

export function repriceOrder(order: OrderRequest, products: Product[], promotions: Promotion[]): RepriceResult {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = [];

  for (const item of order.items) {
    const product = byId.get(item.productId);
    if (!product || product.slug !== item.slug) return { ok: false, error: "unknown_product" };
    if (!product.inStock) return { ok: false, error: "out_of_stock" };
    const percent = item.upsellDiscountPercent;
    if (percent !== undefined && !OFFER_PERCENTS.has(percent)) return { ok: false, error: "invalid_offer" };
    lines.push({
      lineId: cartLineId(product.id, item.subscription),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: "",
      price: product.price,
      quantity: item.quantity,
      upsellDiscountPercent: percent,
      subscription: item.subscription,
    });
  }

  /*
    A free item exists only as the last step of the upsell ladder: one unit,
    after two discounted steps, worth no more than what those two saved.
  */
  const free = lines.filter((l) => l.upsellDiscountPercent === 100);
  if (free.length > 0) {
    const paidOffers = lines.filter((l) => l.upsellDiscountPercent && l.upsellDiscountPercent < 100);
    const saved = paidOffers.reduce((sum, l) => sum + Math.round((l.price * (l.upsellDiscountPercent ?? 0)) / 100), 0);
    if (free.length > 1 || free[0].quantity !== 1 || paidOffers.length < 2 || free[0].price > saved) {
      return { ok: false, error: "invalid_offer" };
    }
  }

  const totals = computeTotals(lines, promotions, { pickup: order.delivery.method === "pickup" });

  return {
    ok: true,
    order: {
      ...order,
      items: lines.map((l) => ({
        productId: l.productId,
        slug: l.slug,
        name: l.name,
        quantity: l.quantity,
        unitPrice: l.price,
        subscription: l.subscription,
        upsellDiscountPercent: l.upsellDiscountPercent,
      })),
      appliedUpsells: lines.filter((l) => l.upsellDiscountPercent).map((l) => l.productId),
      appliedPromotions: totals.appliedPromotions,
      totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, total: totals.total },
    },
  };
}
