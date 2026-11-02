import type { Category, Product } from "@/lib/shopflow/types";
import { brandOf, cutoutOf } from "@/lib/catalog/product-facts";
import { isStocked } from "@/lib/shop/categories";
import { byDeepestDiscount } from "@/lib/shop/discounts";

/*
  What an ad landing (/lp/<campaign>) shows, decided by the slug alone and
  only from data the shop already has — there is no campaign table to keep in
  step with the ads:

  - `sale` / `aksiya` / `skidki` — the products whose price really dropped;
  - a stocked category slug    — that shelf;
  - a brand slug               — that brand's line;
  - a product slug             — that product first, then its shelf.

  Anything else is null and the page answers 404: every slug used to answer
  200 with the same generic page, whatever the ad promised.
*/

export const SALE_CAMPAIGNS = ["sale", "aksiya", "skidki"] as const;

export type Campaign =
  | { kind: "sale"; products: Product[] }
  | { kind: "category"; category: Category; products: Product[] }
  | { kind: "brand"; brand: { slug: string; name: string }; products: Product[] }
  | { kind: "product"; product: Product; category: Category | null; products: Product[] };

const MAX = 12;

/** Pack shots first, as on every other shelf; in stock before sold out. */
function ordered(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => Number(!a.inStock) - Number(!b.inStock) || Number(!cutoutOf(a)) - Number(!cutoutOf(b)),
  );
}

export function resolveCampaign(slug: string, catalogue: Product[], categories: Category[]): Campaign | null {
  const key = slug.toLowerCase();
  const listed = catalogue.filter((p) => p.assortment !== "unlisted");

  if ((SALE_CAMPAIGNS as readonly string[]).includes(key)) {
    const products = byDeepestDiscount(listed.filter((p) => p.inStock)).slice(0, MAX);
    return products.length > 0 ? { kind: "sale", products } : null;
  }

  const category = categories.find((c) => c.slug === key && isStocked(c));
  if (category) {
    const products = ordered(listed.filter((p) => p.categorySlug === key)).slice(0, MAX);
    if (products.length > 0) return { kind: "category", category, products };
  }

  const brandProducts = listed.filter((p) => brandOf(p)?.slug === key);
  if (brandProducts.length > 0) {
    return { kind: "brand", brand: brandOf(brandProducts[0])!, products: ordered(brandProducts).slice(0, MAX) };
  }

  const product = listed.find((p) => p.slug === key);
  if (product) {
    const shelf = categories.find((c) => c.slug === product.categorySlug) ?? null;
    const others = ordered(listed.filter((p) => p.id !== product.id && p.categorySlug && p.categorySlug === product.categorySlug));
    return { kind: "product", product, category: shelf, products: [product, ...others].slice(0, MAX) };
  }

  return null;
}
