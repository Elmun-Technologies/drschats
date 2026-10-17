import type { OrderRequest, Product, Promotion } from "@/lib/shopflow/types";
import { MAX_OFFER_QTY, cartLineId, computeTotals, freeGiftAllowed, type CartLine } from "./pricing";
import { isIntervalDays } from "@/lib/subscription/plans";

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
  /** `slug` names the line at fault, so the cart can drop it instead of failing again. */
  | { ok: false; error: "unknown_product" | "out_of_stock" | "invalid_offer"; slug?: string };

export function repriceOrder(
  order: OrderRequest,
  products: Product[],
  promotions: Promotion[],
  offers: OfferContext = NO_OFFERS,
): RepriceResult {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = [];
  const lineIds = new Set<string>();

  for (const item of order.items) {
    const product = byId.get(item.productId);
    if (!product || product.slug !== item.slug) return { ok: false, error: "unknown_product", slug: item.slug };
    // A withdrawn product keeps its page for old links, but is no longer sold.
    if (!product.inStock || product.assortment === "unlisted") return { ok: false, error: "out_of_stock", slug: item.slug };
    if (item.subscription && !isIntervalDays(item.subscription.intervalDays)) {
      return { ok: false, error: "invalid_offer", slug: item.slug };
    }
    const percent = item.upsellDiscountPercent;
    const lineId = cartLineId(product.id, item.subscription, percent);
    // The cart merges equal lines, so a repeated line id was not made by it.
    if (lineIds.has(lineId)) return { ok: false, error: "invalid_offer", slug: item.slug };
    lineIds.add(lineId);
    lines.push({
      lineId,
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
  const ladderPercents = new Set<number>();
  const offerQty = new Map<string, number>();
  for (const l of lines) {
    const percent = l.upsellDiscountPercent;
    if (!percent) continue;
    /*
      The cap is per product and offer, across lines: a subscription and a
      one-off line at the same percent are different line ids, and splitting
      an offer over them must not lift the limit.
    */
    const key = `${l.productId}:${percent}`;
    const qty = (offerQty.get(key) ?? 0) + l.quantity;
    offerQty.set(key, qty);
    if (percent < 100 && qty > MAX_OFFER_QTY) return { ok: false, error: "invalid_offer", slug: l.slug };
    if (offers.programs.get(l.slug)?.has(percent)) continue;
    if (offers.rail.get(l.slug)?.has(percent)) continue;
    /*
      Each ladder step once: the cart rebuilds the ladder after an accept and
      hides steps whose percent is already taken (CheckoutForm), so a second
      line at the same ladder percent is not an offer the shop made.
    */
    if (
      !LADDER_PERCENTS.has(percent) ||
      base.length === 0 ||
      !offers.ladderPool.has(l.slug) ||
      ladderPercents.has(percent)
    ) {
      return { ok: false, error: "invalid_offer", slug: l.slug };
    }
    ladderPercents.add(percent);
  }

  if (!freeGiftAllowed(lines)) {
    return { ok: false, error: "invalid_offer", slug: lines.find((l) => l.upsellDiscountPercent === 100)?.slug };
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
