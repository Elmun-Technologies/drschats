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

/** The upsell ladder's steps: −10%, −15%, −20%, or free (lib/upsell/ladder.ts). */
const LADDER_PERCENTS = new Set([10, 15, 20, 100]);

/**
 * The offers the shop actually made, gathered by the caller:
 * - `programs`: product slug → the discounts of the programmes that contain it;
 * - `rail`: product slug → the discount the product page's upsell rail offers
 *   for it, next to a product already in this order.
 */
export interface OfferContext {
  programs: Map<string, Set<number>>;
  rail: Map<string, Set<number>>;
  /** Slugs the upsell ladder draws from (the popular pool the cart and the modal use). */
  ladderPool: Set<string>;
}

const NO_OFFERS: OfferContext = { programs: new Map(), rail: new Map(), ladderPool: new Set() };

export type RepriceResult =
  | { ok: true; order: OrderRequest }
  | { ok: false; error: "unknown_product" | "out_of_stock" | "invalid_offer" };

export function repriceOrder(
  order: OrderRequest,
  products: Product[],
  promotions: Promotion[],
  offers: OfferContext = NO_OFFERS,
): RepriceResult {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = [];

  for (const item of order.items) {
    const product = byId.get(item.productId);
    if (!product || product.slug !== item.slug) return { ok: false, error: "unknown_product" };
    if (!product.inStock) return { ok: false, error: "out_of_stock" };
    const percent = item.upsellDiscountPercent;
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
    Every discounted line has to be an offer the shop made. A programme
    discount needs the product to be in a programme at that percent; a rail
    discount needs the rail beside a product in this order to offer it. What
    is left can only be a ladder step: a product from the ladder's pool, at a
    ladder percent, alongside something bought at full price — the ladder is
    offered on top of a cart, never instead of one. (The cart rebuilds the
    ladder after every accepted step, so several lines can share a percent.)
  */
  const base = lines.filter((l) => !l.upsellDiscountPercent);
  for (const l of lines) {
    const percent = l.upsellDiscountPercent;
    if (!percent) continue;
    if (offers.programs.get(l.slug)?.has(percent)) continue;
    if (offers.rail.get(l.slug)?.has(percent)) continue;
    if (!LADDER_PERCENTS.has(percent) || base.length === 0 || !offers.ladderPool.has(l.slug)) {
      return { ok: false, error: "invalid_offer" };
    }
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
