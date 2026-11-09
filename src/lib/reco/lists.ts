/*
  Every product rail the shop measures (docs/REJA-JALB-QILISH.md §5). The id
  travels as GA4's `item_list_id` and as `meta.list` on the journey events, so
  the admin report and GA4 group the same way. Pure module: the server page
  passes ids to the client tracker, both read them from here.
*/

export const RECO_LISTS = [
  "home_for_you",
  "home_deals",
  "home_brand",
  "home_popular",
  "pdp_similar",
  "pdp_recent",
  "toast_similar",
  "cart_gap",
] as const;

export type RecoList = (typeof RECO_LISTS)[number];

/**
 * Which recommendation algorithm drew the rail. `v1` is today's engine; the
 * A/B stage (D2) sets `v2` for its half of the visitors.
 */
export const RECO_VARIANT = "v1";

/** At most this many slugs are recorded per impression — rails show 6–12. */
export const MAX_IMPRESSION_SLUGS = 24;

const SLUG_RE = /^[a-z0-9-]{1,120}$/;

export function isRecoList(value: unknown): value is RecoList {
  return typeof value === "string" && (RECO_LISTS as readonly string[]).includes(value);
}

/** The slugs as they will be stored: valid, unique, in rail order, capped. */
export function impressionSlugs(slugs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of slugs) {
    if (!SLUG_RE.test(slug) || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
    if (out.length === MAX_IMPRESSION_SLUGS) break;
  }
  return out;
}

export type RecoItem = { slug: string; name: string; price: number; categorySlug?: string | null };

/**
 * What a rail hands the client tracker: the four fields analytics needs, so a
 * server component does not serialise whole products a second time.
 */
export function recoItems(products: readonly RecoItem[]): RecoItem[] {
  return products.map(({ slug, name, price, categorySlug }) => ({ slug, name, price, categorySlug: categorySlug ?? null }));
}
