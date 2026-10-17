/*
  Commercial rules that the storefront quotes in more than one place.

  Every one of these numbers was previously written out by hand wherever it was
  mentioned, so the site contradicted itself: free shipping was 300 000 on the
  cart and 500 000 in a home-page banner, delivery was "24 soat" in the trust
  ribbon and "1–3 kun" in the FAQ, and the loyalty page advertised a 15%
  cashback that no other page knew about.

  The rule from here on: if a number appears in copy, it appears as a
  translation placeholder fed from this file. The remaining literals are the
  ones inside translated strings that quote a value — those are re-generated
  from here by hand whenever a value changes.

  The threshold, the courier fee and the subscription percents are now the
  admin's (/admin/commerce, lib/commerce/settings.ts): the values below are
  only their DEFAULTS, used until an admin saves a change. Code that prices or
  quotes them reads the effective setting (server: getCommerceSettings,
  client: useCommerce), never these constants. Translations quote them through
  placeholders; `src/lib/commerce/copy-literals.test.ts` fails if a hard-coded
  copy of a default sneaks back into the messages.
*/

export const COMMERCE = {
  /** One threshold for the whole site. */
  freeShippingOver: 300_000,

  /** Flat courier fee below the threshold (Tashkent). */
  shippingFee: 30_000,

  delivery: {
    /**
     * What we promise on the product page, the ribbon, the FAQ and the
     * checkout success screen. Tashkent is same-day/next-day; the regions
     * depend on the courier, so the promise is a window and the operator
     * confirms the exact date.
     */
    tashkent: { hours: 24, label: "24 soat" },
    regions: { label: "1–3 kun" },
  },

  discounts: {
    /** First order, once per customer, on any basket. */
    firstOrderPercent: 10,
    /** Subscribe & Save: today's delivery, then every later one. */
    subscriptionFirstPercent: 10,
    subscriptionRecurringPercent: 15,
    /** Cap for the loyalty club, which shares the same ladder as the rest. */
    loyaltyMaxPercent: 15,
  },

  returns: {
    /**
     * BAD (food supplements) are not medicines, so a "no questions asked"
     * multi-week return is a promise the law does not require and a pharmacy
     * cannot honour on opened stock. The window below is what the site may
     * state until a lawyer signs off the final wording — see
     * docs/GOVITA-TAVSIYALAR.md.
     */
    unopenedWindowDays: 14,
    openedReturnable: false,
  },
} as const;

/** `formatMoney`-free helper for the "300 000 so'm" copy in translations. */
export function thousands(value: number): string {
  return value.toLocaleString("ru-RU").replace(/\u00a0/g, " ");
}
