import type { Promotion } from "@/lib/shopflow/types";
import {
  FIRST_ORDER_PERCENT,
  RECURRING_PERCENT,
  SUBSCRIPTION_FREE_SHIPPING_OVER,
} from "@/lib/subscription/plans";

export const DEFAULT_SHIPPING = 30000;

/** The order schema caps a line at 99 units (shopflow/schemas.ts). */
export const MAX_LINE_QTY = 99;

/** An offer price (upsell, programme, rail) is for a few units, not a stock-up. */
export const MAX_OFFER_QTY = 3;

/** The most units a line may hold: one free gift, a few at an offer price, otherwise the schema cap. */
export function lineQtyCap(l: Pick<CartLine, "upsellDiscountPercent">): number {
  if (l.upsellDiscountPercent === 100) return 1;
  return l.upsellDiscountPercent ? MAX_OFFER_QTY : MAX_LINE_QTY;
}

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
  /** Set by `syncPrices` when the catalogue says the product is sold out. */
  soldOut?: boolean;
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

/**
 * The line key for a product bought in a given mode and at a given offer.
 *
 * The offer percent is part of the key: adding at −15% a product that already
 * sits in the cart at full price used to bump the full-price line, so the
 * discount the button promised silently disappeared (and, the other way
 * round, a later full-price add inherited the offer).
 */
export function cartLineId(
  productId: string,
  subscription?: { intervalDays: number },
  offerPercent?: number,
): string {
  const base = subscription ? `${productId}:sub${subscription.intervalDays}` : productId;
  return offerPercent ? `${base}:o${offerPercent}` : base;
}

/** What a line costs after its own offer (upsell, programme, gift), before promotions. */
export function lineTotal(l: Pick<CartLine, "price" | "quantity" | "upsellDiscountPercent">): number {
  const gross = l.price * l.quantity;
  return gross - (l.upsellDiscountPercent ? Math.round((gross * l.upsellDiscountPercent) / 100) : 0);
}

/** The struck-through "before" figure for a line: its catalogue old price, or its price when an offer applies. */
export function lineListTotal(l: Pick<CartLine, "price" | "oldPrice" | "quantity" | "upsellDiscountPercent">): number | null {
  const ref = l.oldPrice && l.oldPrice > l.price ? l.oldPrice : l.upsellDiscountPercent ? l.price : null;
  return ref ? ref * l.quantity : null;
}

/**
 * Whether a promotion counts this line. Promotions do not stack on a line that
 * already carries its own offer (upsell, programme, gift) or a subscription
 * discount: 2+1 on top of a −20% ladder step was 53% off.
 */
export function promotionApplies(
  promo: Pick<Promotion, "productSlugs">,
  l: Pick<CartLine, "slug" | "upsellDiscountPercent" | "subscription">,
): boolean {
  if (l.upsellDiscountPercent || l.subscription) return false;
  return !promo.productSlugs || promo.productSlugs.includes(l.slug);
}

/** Units to add to this line for the next free one under a buy-2-get-1 promotion (0 = not applicable). */
export function bonusUnitsNeeded(l: CartLine, promotions: Promotion[]): number {
  const promo = promotions.find((p) => p.type === "buy_x_get_y" && promotionApplies(p, l));
  if (!promo) return 0;
  return l.quantity % 3 === 2 ? 1 : 0;
}

type OfferLine = Pick<CartLine, "price" | "quantity" | "upsellDiscountPercent">;

/**
 * The free gift is the upsell ladder's last step: one unit, after two
 * discounted steps, worth no more than those two saved. The server refuses an
 * order that breaks this (reprice.ts), so the cart applies the same rule and
 * drops a gift whose conditions stopped holding instead of letting checkout
 * fail.
 */
export function freeGiftAllowed(lines: OfferLine[]): boolean {
  const free = lines.filter((l) => l.upsellDiscountPercent === 100);
  if (free.length === 0) return true;
  const paid = lines.filter((l) => l.upsellDiscountPercent && l.upsellDiscountPercent < 100);
  const saved = paid.reduce((sum, l) => sum + Math.round((l.price * (l.upsellDiscountPercent ?? 0)) / 100), 0);
  return free.length === 1 && free[0].quantity === 1 && paid.length >= 2 && free[0].price <= saved;
}

/**
 * Pure, testable pricing engine. Mirrors Shopflow's sales logic so the cart
 * preview matches the operator's confirmed total: upsell discounts +
 * promotions (percent off, buy-2-get-1, free shipping over a threshold).
 */
export function computeTotals(
  lines: CartLine[],
  promotions: Promotion[] = [],
  options: { pickup?: boolean } = {},
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
      const base = lines.filter((l) => promotionApplies(promo, l)).reduce((sum, l) => sum + l.price * l.quantity, 0);
      if (base > 0) {
        discount += Math.round((base * promo.percent) / 100);
        appliedPromotions.push(promo.id);
      }
    }
    if (promo.type === "buy_x_get_y") {
      // Buy 2, get the 3rd free — per identical line, on lines without an offer of their own.
      let promoDiscount = 0;
      for (const l of lines) {
        if (!promotionApplies(promo, l)) continue;
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

  // Collecting from the warehouse costs nothing — the delivery page says so.
  let shipping = itemCount > 0 && !options.pickup ? DEFAULT_SHIPPING : 0;
  let freeShippingRemaining = 0;
  if (Number.isFinite(freeShippingThreshold) && !options.pickup) {
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
