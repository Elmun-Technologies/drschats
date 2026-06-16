import type { Promotion } from "@/lib/shopflow/types";

export const DEFAULT_SHIPPING = 30000;

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  /** Set when the line was added via an upsell offer (extra discount). */
  upsellDiscountPercent?: number;
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

  // Promotions
  let freeShippingThreshold = Infinity;
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
  };
}
