/*
  The 18+ part of the catalogue (Dolphi condoms — the shop is the official
  distributor). Its products live in one category and stay out of every shared
  surface: catalogue, search, home and recommendation rails, upsells, the quiz,
  recently viewed, feeds and ad pixels. They are shown on their own page and
  their own product pages, behind the age gate, and in what the visitor already
  chose (cart, wishlist, compare, orders).
*/
export const ADULT_CATEGORY = "adult";

/** The 18+ page; linked from the catalogue menu and footer only while the shelf has products. */
export const COUPLES_HREF = "/couples";

/** Cookie set once the visitor confirms they are 18+; kept 30 days. */
export const AGE_COOKIE = "gv_age18";
export const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function isAdult(product: { categorySlug?: string | null }): boolean {
  return product.categorySlug === ADULT_CATEGORY;
}
