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

import { COMMERCE } from "@/lib/config/commerce";

export const SUBSCRIPTION_INTERVALS = [30, 45, 60, 90] as const;
export type IntervalDays = (typeof SUBSCRIPTION_INTERVALS)[number];

/** Most packs are a 30-day course, so that is the default and the popular one. */
export const DEFAULT_INTERVAL: IntervalDays = 30;

/*
  The percents are the admin's commerce rules (/admin/commerce); these two are
  their defaults. Pages read the effective ones (server: getCommerceSettings,
  client: useCommerce) and pass them in; the free-shipping threshold is the
  site's one threshold, applied by computeTotals.
*/
/** Default off the first order, placed today. */
export const FIRST_ORDER_PERCENT = COMMERCE.discounts.subscriptionFirstPercent;
/** Default off every delivery after the first, for as long as the subscription runs. */
export const RECURRING_PERCENT = COMMERCE.discounts.subscriptionRecurringPercent;

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

export function subscriptionPricing(
  price: number,
  percents: { firstPercent: number; recurringPercent: number } = { firstPercent: FIRST_ORDER_PERCENT, recurringPercent: RECURRING_PERCENT },
): SubscriptionPricing {
  const { firstPercent, recurringPercent } = percents;
  return {
    firstPrice: Math.round(price * (1 - firstPercent / 100)),
    recurringPrice: Math.round(price * (1 - recurringPercent / 100)),
    firstPercent,
    recurringPercent,
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
