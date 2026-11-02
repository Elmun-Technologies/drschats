import { BRAND } from "@/lib/brand";
import type { Product } from "@/lib/shopflow/types";

/*
  Pages that exist and stay linked (footer, checkout consent) but have nothing
  of their own to show yet. Each one is `noindex` and absent from the sitemap
  for exactly as long as the fact below is false — the page metadata and
  sitemap.ts read the same predicate, so the two can never disagree.
*/

/** /reviews renders "no reviews yet" until a product carries a real review or a customer story is published. */
export function hasReviews(products: Pick<Product, "reviews">[], storyCount: number): boolean {
  return storyCount > 0 || products.some((p) => (p.reviews?.length ?? 0) > 0);
}

/** /licenses is a list of "on request" lines until the licence number is in hand. */
export function hasLicence(): boolean {
  return Boolean(BRAND.legal.licence);
}

/**
 * /offer shows a "being prepared by a lawyer" notice and links to the rules
 * the site applies. Set to true in the same change that puts the lawyer's
 * text on the page.
 */
export const OFFER_PUBLISHED = false;

/** /loyalty without points, referral or birthday is the first-order card the home page already shows. */
export function loyaltyProgrammeLive(rules: {
  enabled: boolean;
  referral: { enabled: boolean };
  birthday: { enabled: boolean };
}): boolean {
  return rules.enabled || rules.referral.enabled || rules.birthday.enabled;
}
