import type { Promotion } from "@/lib/shopflow/types";
import {
  FIRST_ORDER_PERCENT,
  RECURRING_PERCENT,
  SUBSCRIPTION_FREE_SHIPPING_OVER,
} from "@/lib/subscription/plans";

export const DEFAULT_SHIPPING = 30000;

export interface CartLine {
  /**
   * Identifies the line, not the product.
   *
   * A product bought once and the same product on a 30-day subscription are two
   * different things to buy, at two different prices, and they have to be able
   * to sit in the cart at the same time. Keying lines by product id alone made
   * the second add silently inherit the first one's purchase mode — which, in
   * the direction that mattered, signed someone up to a recurring order they
   * did not ask for.
   */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  /** Set when the line was added via an upsell offer (extra discount). */
  upsellDiscountPercent?: number;
  /** Set when the line was added as a repeating delivery. */
  subscription?: { intervalDays: number };
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  appliedPromotions: string[];
  /** UZS still needed to unlock free shipping (0 if already unlocked). */
  freeShippingRemaining: number;
  freeShippingThreshold: number;
  /** True when at least one line repeats. */
  hasSubscription: boolean;
  /**
   * What the repeating part of this cart will cost on every later delivery,
   * at the higher recurring discount. 0 when nothing repeats.
   */
  recurringTotal: number;
}

/** The line key for a product bought in a given mode. */
export function cartLineId(productId: string, subscription?: { intervalDays: number }): string {
  return subscription ? `${productId}:sub${subscription.intervalDays}` : productId;
}

/**
 * Pure, testable pricing engine. Mirrors Shopflow's sales logic so the cart
 * preview matches the operator's confirmed total: upsell discounts +
 * promotions (percent off, buy-2-get-1, free shipping over a threshold).
 */
export function computeTotals(
  lines: CartLine[],
  promotions: Promotion[] = [],
): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  let discount = 0;
  const appliedPromotions: string[] = [];

  // Upsell line discounts
  for (const l of lines) {
    if (l.upsellDiscountPercent) {
      discount += Math.round((l.price * l.quantity * l.upsellDiscountPercent) / 100);
    }
  }

  /*
    Subscription lines.

    The discount on this order is the smaller, first-order one; the recurring
    figure is quoted separately rather than folded into the total, because the
    customer is paying today's price today. Lines that arrived through an
    upsell keep their own discount and do not stack — the deeper of the two
    already applied above.
  */
  const subscriptionLines = lines.filter((l) => l.subscription);
  let recurringTotal = 0;
  for (const l of subscriptionLines) {
    const lineTotal = l.price * l.quantity;
    recurringTotal += Math.round((lineTotal * (100 - RECURRING_PERCENT)) / 100);
    if (!l.upsellDiscountPercent) {
      discount += Math.round((lineTotal * FIRST_ORDER_PERCENT) / 100);
    }
  }

  // Promotions
  let freeShippingThreshold = subscriptionLines.length > 0 ? SUBSCRIPTION_FREE_SHIPPING_OVER : Infinity;
  for (const promo of promotions) {
    if (promo.type === "percent_off" && promo.percent) {
      discount += Math.round((subtotal * promo.percent) / 100);
      appliedPromotions.push(promo.id);
    }
    if (promo.type === "buy_x_get_y") {
      // Buy 2, get the 3rd free — per identical line.
      let promoDiscount = 0;
      for (const l of lines) {
        const free = Math.floor(l.quantity / 3);
        promoDiscount += free * l.price;
      }
      if (promoDiscount > 0) {
        discount += promoDiscount;
        appliedPromotions.push(promo.id);
      }
    }
    if (promo.type === "free_shipping_over" && promo.threshold != null) {
      freeShippingThreshold = Math.min(freeShippingThreshold, promo.threshold);
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);

  let shipping = itemCount > 0 ? DEFAULT_SHIPPING : 0;
  let freeShippingRemaining = 0;
  if (Number.isFinite(freeShippingThreshold)) {
    if (afterDiscount >= freeShippingThreshold) {
      shipping = 0;
    } else if (itemCount > 0) {
      freeShippingRemaining = freeShippingThreshold - afterDiscount;
    }
  }

  return {
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
    itemCount,
    appliedPromotions,
    freeShippingRemaining,
    freeShippingThreshold: Number.isFinite(freeShippingThreshold)
      ? freeShippingThreshold
      : 0,
    hasSubscription: subscriptionLines.length > 0,
    recurringTotal,
  };
}
