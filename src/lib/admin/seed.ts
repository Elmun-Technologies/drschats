import { and, count, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories, products, siteSettings } from "@/lib/db/schema";
import { rawCategories, rawProducts } from "@/lib/shopflow/mock";
import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";
import { PRODUCT_CUTOUTS, categoryCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS } from "@/lib/content/product-units";
import { ALL_BRANDS, productBrand } from "@/lib/content/product-brands";
import { catalogDiff, parseDismissed, resolveCategorySlug, type BuiltInCatalog, type CatalogSnapshot } from "./catalog-sync";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
type Db = ReturnType<typeof getDb> | Tx;

const SEEDED_KEY = "catalog.seededAt";
export const IMPORT_DISMISSED_KEY = "catalog.importDismissed";
const SEED_LOCK = 7_340_003;

/** The catalogue the site ships with, in the shape the sync diff compares. */
export function builtInCatalog(): BuiltInCatalog {
  return {
    products: rawProducts.map((raw) => ({
      id: raw.id,
      slug: raw.slug,
      name: raw.name.uz,
      categorySlug: raw.categorySlug,
      images: PRODUCT_PHOTOS[raw.slug] ?? [],
      cutout: PRODUCT_CUTOUTS[raw.slug] ?? null,
    })),
    categories: rawCategories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name.uz,
      image: categoryCutout(cat.slug) ?? cat.image ?? null,
    })),
    brands: ALL_BRANDS.map((b) => ({ slug: b.slug, name: b.name })),
  };
}

async function snapshot(db: Db): Promise<CatalogSnapshot> {
  const [p, c, b] = await Promise.all([
    db.select({ id: products.id, slug: products.slug, images: products.images, cutout: products.cutout }).from(products),
    db.select({ id: categories.id, slug: categories.slug, image: categories.image }).from(categories),
    db.select({ slug: brands.slug }).from(brands),
  ]);
  return { products: p, categories: c, brands: b };
}

/** What the panel lacks compared with the site's built-in catalogue (for the products page prompt). */
export async function builtInCatalogStatus() {
  const db = getDb();
  const [snap, [dismissed]] = await Promise.all([
    snapshot(db),
    db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, IMPORT_DISMISSED_KEY)).limit(1),
  ]);
  return { diff: catalogDiff(builtInCatalog(), snap, parseDismissed(dismissed?.value)), empty: snap.products.length === 0 };
}

/*
  Copies the built-in catalogue into the database. Insert-only: a row that is
  already there (by id or slug) is left alone, so running it again never
  overwrites what an admin has edited. The one write to an existing row is
  the backfill: a product matching a built-in one by slug that has neither
  photos nor a cutout gets the site's photos — empty fields only.
*/
export async function insertBuiltInCatalog(tx: Tx) {
  const c = await tx
    .insert(categories)
    .values(
      rawCategories.map((cat, i) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: categoryCutout(cat.slug) ?? cat.image,
        sort: i,
      })),
    )
    .onConflictDoNothing()
    .returning({ slug: categories.slug });
  const b = await tx
    .insert(brands)
    .values(ALL_BRANDS.map((brand, i) => ({ slug: brand.slug, name: brand.name, sort: i })))
    .onConflictDoNothing()
    .returning({ slug: brands.slug });

  // A category renamed or deleted in the panel must not break the foreign key.
  const dbCategories = await tx.select({ id: categories.id, slug: categories.slug }).from(categories);
  const p = await tx
    .insert(products)
    .values(
      rawProducts.map((raw, i) => ({
        id: raw.id,
        slug: raw.slug,
        categorySlug: resolveCategorySlug(raw.categorySlug, rawCategories, dbCategories),
        brandSlug: productBrand(raw.slug)?.slug ?? null,
        price: raw.price,
        oldPrice: raw.oldPrice ?? null,
        saleEndsAt: raw.saleEndsAt ? new Date(raw.saleEndsAt) : null,
        inStock: raw.inStock,
        kind: raw.kind ?? "core",
        sort: i,
        images: PRODUCT_PHOTOS[raw.slug] ?? [],
        cutout: PRODUCT_CUTOUTS[raw.slug] ?? null,
        unit: PRODUCT_UNITS[raw.slug] ?? null,
        content: {
          name: raw.name,
          tagline: raw.tagline,
          description: raw.description,
          highlights: raw.highlights,
          benefits: raw.benefits,
          ingredients: raw.ingredients,
          howToUse: raw.howToUse,
          faq: raw.faq,
          badges: raw.badges,
          servings: raw.servings,
          origin: raw.origin,
          ...(raw.searchAliases ? { searchAliases: raw.searchAliases } : {}),
        },
      })),
    )
    .onConflictDoNothing()
    .returning({ slug: products.slug });

  const backfill = await backfillBuiltInImages(tx);
  return { categories: c.length, brands: b.length, products: p.length, ...backfill };
}

/* Fills photos/cutout (products) and image (categories) only where the database row has none. */
async function backfillBuiltInImages(tx: Tx) {
  const diff = catalogDiff(builtInCatalog(), await snapshot(tx));
  let imagesFilled = 0;
  for (const row of diff.backfillProducts) {
    const updated = await tx
      .update(products)
      .set({ images: row.images, cutout: row.cutout, updatedAt: new Date() })
      // Re-checked in the statement: a save between the snapshot and here wins.
      .where(and(eq(products.slug, row.slug), isNull(products.cutout), sql`jsonb_array_length(${products.images}) = 0`))
      .returning({ slug: products.slug });
    imagesFilled += updated.length;
  }
  let categoryImagesFilled = 0;
  for (const row of diff.backfillCategories) {
    const updated = await tx
      .update(categories)
      .set({ image: row.image, updatedAt: new Date() })
      .where(and(eq(categories.slug, row.slug), isNull(categories.image)))
      .returning({ slug: categories.slug });
    categoryImagesFilled += updated.length;
  }
  return { imagesFilled, categoryImagesFilled };
}

/** Remembers what is missing right now as "not wanted", so the prompt stops asking about it. */
export async function dismissBuiltInImport(keys: string[]) {
  const db = getDb();
  const [current] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, IMPORT_DISMISSED_KEY)).limit(1);
  const value = JSON.stringify([...new Set([...parseDismissed(current?.value), ...keys])]);
  await db
    .insert(siteSettings)
    .values({ key: IMPORT_DISMISSED_KEY, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

/**
 * First boot with a database: the shop's existing catalogue lands in the
 * admin panel on its own, so the team edits the products the site already
 * shows instead of starting from an empty list. Runs once — the marker stops
 * it from bringing back products an admin later deleted.
 */
export async function autoSeedCatalog(): Promise<{ seeded: number } | null> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK})`);
    const [marker] = await tx.select({ key: siteSettings.key }).from(siteSettings).where(eq(siteSettings.key, SEEDED_KEY)).limit(1);
    if (marker) return null;
    const [{ n }] = await tx.select({ n: count() }).from(products);
    const result = n === 0 ? await insertBuiltInCatalog(tx) : null;
    await tx.insert(siteSettings).values({ key: SEEDED_KEY, value: new Date().toISOString() }).onConflictDoNothing();
    return { seeded: result?.products ?? 0 };
  });
}
