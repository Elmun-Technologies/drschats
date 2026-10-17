/*
  What the site's built-in catalogue has that the admin panel does not.

  Pure, so the comparison is tested without a database (catalog-sync.test.ts).
  A row counts as present when either its slug or its id matches: a product an
  admin renamed keeps its built-in id, and importing it again would collide on
  that id — reporting it as "missing" forever would be a lie the import button
  can never fix.

  Backfill covers one narrow case: a database product that matches a built-in
  one by slug and has neither photos nor a cutout. Only empty fields are
  filled; nothing an admin typed is ever replaced.
*/

export interface BuiltInProduct {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  images: string[];
  cutout: string | null;
}

export interface BuiltInCategory {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export interface BuiltInBrand {
  slug: string;
  name: string;
}

export interface BuiltInCatalog {
  products: BuiltInProduct[];
  categories: BuiltInCategory[];
  brands: BuiltInBrand[];
}

export interface CatalogSnapshot {
  products: { id: string; slug: string; images: string[]; cutout: string | null }[];
  categories: { id: string; slug: string; image: string | null }[];
  brands: { slug: string }[];
}

export interface CatalogDiff {
  missingProducts: BuiltInProduct[];
  missingCategories: BuiltInCategory[];
  missingBrands: BuiltInBrand[];
  /** Database products (by slug) whose empty photos/cutout the built-in catalogue can fill. */
  backfillProducts: { slug: string; images: string[]; cutout: string | null }[];
  /** Database categories (by slug) with no image that the built-in catalogue can fill. */
  backfillCategories: { slug: string; image: string }[];
  /** Missing items the team has not dismissed — the ones worth a prompt. */
  pending: number;
}

export const dismissKey = {
  product: (slug: string) => `p:${slug}`,
  category: (slug: string) => `c:${slug}`,
  brand: (slug: string) => `b:${slug}`,
};

export function catalogDiff(builtIn: BuiltInCatalog, db: CatalogSnapshot, dismissed: readonly string[] = []): CatalogDiff {
  const productIds = new Set(db.products.map((p) => p.id));
  const productSlugs = new Set(db.products.map((p) => p.slug));
  const categoryIds = new Set(db.categories.map((c) => c.id));
  const categorySlugs = new Set(db.categories.map((c) => c.slug));
  const brandSlugs = new Set(db.brands.map((b) => b.slug));
  const skip = new Set(dismissed);

  const missingProducts = builtIn.products.filter((p) => !productSlugs.has(p.slug) && !productIds.has(p.id));
  const missingCategories = builtIn.categories.filter((c) => !categorySlugs.has(c.slug) && !categoryIds.has(c.id));
  const missingBrands = builtIn.brands.filter((b) => !brandSlugs.has(b.slug));

  const builtInBySlug = new Map(builtIn.products.map((p) => [p.slug, p]));
  const backfillProducts = db.products.flatMap((row) => {
    const source = builtInBySlug.get(row.slug);
    if (!source || row.images.length > 0 || row.cutout) return [];
    if (source.images.length === 0 && !source.cutout) return [];
    return [{ slug: row.slug, images: source.images, cutout: source.cutout }];
  });

  const categoryBySlug = new Map(builtIn.categories.map((c) => [c.slug, c]));
  const backfillCategories = db.categories.flatMap((row) => {
    const image = categoryBySlug.get(row.slug)?.image;
    return !row.image && image ? [{ slug: row.slug, image }] : [];
  });

  const pending =
    missingProducts.filter((p) => !skip.has(dismissKey.product(p.slug))).length +
    missingCategories.filter((c) => !skip.has(dismissKey.category(c.slug))).length +
    missingBrands.filter((b) => !skip.has(dismissKey.brand(b.slug))).length;

  return { missingProducts, missingCategories, missingBrands, backfillProducts, backfillCategories, pending };
}

/** The keys to remember when the team hides the prompt for what is missing right now. */
export function dismissKeysOf(diff: Pick<CatalogDiff, "missingProducts" | "missingCategories" | "missingBrands">): string[] {
  return [
    ...diff.missingProducts.map((p) => dismissKey.product(p.slug)),
    ...diff.missingCategories.map((c) => dismissKey.category(c.slug)),
    ...diff.missingBrands.map((b) => dismissKey.brand(b.slug)),
  ];
}

/**
 * The category a built-in product should land in. The built-in slug when the
 * database has it; else the slug the same category (by id) was renamed to;
 * else none — inserting a dangling slug would break the foreign key and with
 * it the whole import.
 */
export function resolveCategorySlug(
  builtInSlug: string,
  builtInCategories: readonly { id: string; slug: string }[],
  dbCategories: readonly { id: string; slug: string }[],
): string | null {
  if (dbCategories.some((c) => c.slug === builtInSlug)) return builtInSlug;
  const id = builtInCategories.find((c) => c.slug === builtInSlug)?.id;
  return (id && dbCategories.find((c) => c.id === id)?.slug) || null;
}

export function parseDismissed(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}
