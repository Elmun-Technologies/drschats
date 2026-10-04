/*
  Subscribe & Save.

  Vitamins are the textbook subscription product: a pack is a course, a course
  runs out, and the value of the course depends on not stopping. The customer
  already has to remember to reorder — the reorder reminder in this codebase
  exists because they often do not — so offering to do it for them is worth a
  standing discount.

  Terms, in one place because they are quoted in four:

  - the first delivery is discounted, and every later one is discounted more:
    the recurring price is the point, and a subscription that is only cheap
    once is a coupon wearing a costume;
  - subscription orders reach free shipping earlier than one-off orders, since
    the cost of serving them is lower and predictable;
  - and it can be paused, skipped, re-timed or cancelled from the account page
    without talking to anyone. That last one is not generosity: a subscription
    that is hard to leave is a chargeback and a lost customer, in that order.
*/

import { COMMERCE, thousands } from "@/lib/config/commerce";

export const SUBSCRIPTION_INTERVALS = [30, 45, 60, 90] as const;
export type IntervalDays = (typeof SUBSCRIPTION_INTERVALS)[number];

/** Most packs are a 30-day course, so that is the default and the popular one. */
export const DEFAULT_INTERVAL: IntervalDays = 30;

/** Off the first order, placed today — the same 10% as the first-order offer. */
export const FIRST_ORDER_PERCENT = COMMERCE.discounts.subscriptionFirstPercent;
/** Off every delivery after the first, for as long as the subscription runs. */
export const RECURRING_PERCENT = COMMERCE.discounts.subscriptionRecurringPercent;

/**
 * Subscription orders ship free above this; one-off orders use the same
 * threshold from the same file. Two numbers for one rule is how a site ends up
 * advertising 300 000 in the cart and 500 000 in a banner.
 */
export const SUBSCRIPTION_FREE_SHIPPING_OVER = COMMERCE.freeShippingOver;

/** "300 000" — for the copy that has to quote the threshold in a sentence. */
export const FREE_SHIPPING_LABEL = thousands(COMMERCE.freeShippingOver);

export function isIntervalDays(value: unknown): value is IntervalDays {
  return (SUBSCRIPTION_INTERVALS as readonly number[]).includes(value as number);
}

export interface SubscriptionPricing {
  /** Unit price on the order placed today. */
  firstPrice: number;
  /** Unit price on every delivery after that. */
  recurringPrice: number;
  firstPercent: number;
  recurringPercent: number;
}

export function subscriptionPricing(price: number): SubscriptionPricing {
  return {
    firstPrice: Math.round(price * (1 - FIRST_ORDER_PERCENT / 100)),
    recurringPrice: Math.round(price * (1 - RECURRING_PERCENT / 100)),
    firstPercent: FIRST_ORDER_PERCENT,
    recurringPercent: RECURRING_PERCENT,
  };
}

/**
 * Price per dose, and only when the pack really is a countable dose.
 *
 * The field holds free text — "60 kapsula", "1 shisha · 200 ml", "250 g",
 * "1 dona" — and dividing by whatever number appears in it produced nonsense:
 * a Delical bottle written as "200 ml × 1 shisha" was read as 200 servings and
 * advertised at 502 so'm per serving; a 250 g coffee pack would have been
 * quoted per gram.
 *
 * So: a count is used only when the string is "<n> <dose word>" — capsules and
 * tablets are doses, millilitres, grams and a lone "1 dona" are not, and those
 * products simply show no per-dose figure. The number must also describe the
 * whole pack ("1 dona, 2 yillik kafolat" is a device, not one dose), and a
 * qualifier is allowed between the two ("20 shipuchi tabletka").
 */
const DOSE_COUNT = /^\s*(\d[\d\s]*)\s+(?:[\p{L}'\u2019]+\s+){0,2}(?:kapsul|tablet|таблет|капсул)/iu;

export function pricePerServing(price: number, servings: string | number | undefined): number | null {
  if (servings === undefined) return null;
  const count =
    typeof servings === "number"
      ? servings
      : Number.parseInt(DOSE_COUNT.exec(servings)?.[1]?.replace(/\s/g, "") ?? "", 10);
  if (!Number.isFinite(count) || count <= 0) return null;
  return Math.round(price / count);
}

/** The date a subscription created today would next deliver on. */
export function nextDeliveryDate(intervalDays: number, from: Date): Date {
  return new Date(from.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}
