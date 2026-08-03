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

export const SUBSCRIPTION_INTERVALS = [30, 45, 60, 90] as const;
export type IntervalDays = (typeof SUBSCRIPTION_INTERVALS)[number];

/** Most packs are a 30-day course, so that is the default and the popular one. */
export const DEFAULT_INTERVAL: IntervalDays = 30;

/** Off the first order, placed today. */
export const FIRST_ORDER_PERCENT = 10;
/** Off every delivery after the first. */
export const RECURRING_PERCENT = 15;

/** Subscription orders ship free above this; one-off orders use the promotion. */
export const SUBSCRIPTION_FREE_SHIPPING_OVER = 300_000;

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
 * Price per serving, when the product says how many servings it holds.
 *
 * `servings` arrives as a free-text field ("60 kapsula", "30"), so anything
 * that does not start with a number is treated as unknown rather than guessed.
 */
export function pricePerServing(price: number, servings: string | number | undefined): number | null {
  if (servings === undefined) return null;
  const count = typeof servings === "number" ? servings : Number.parseInt(servings, 10);
  if (!Number.isFinite(count) || count <= 0) return null;
  return Math.round(price / count);
}

/** The date a subscription created today would next deliver on. */
export function nextDeliveryDate(intervalDays: number, from: Date): Date {
  return new Date(from.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}
