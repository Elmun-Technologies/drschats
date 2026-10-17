import { count, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories, products, siteSettings } from "@/lib/db/schema";
import { rawCategories, rawProducts } from "@/lib/shopflow/mock";
import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";
import { PRODUCT_CUTOUTS, categoryCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS } from "@/lib/content/product-units";
import { ALL_BRANDS, productBrand } from "@/lib/content/product-brands";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

const SEEDED_KEY = "catalog.seededAt";
const SEED_LOCK = 7_340_003;

/*
  Copies the built-in catalogue into the database. Insert-only: a row that is
  already there (by id or slug) is left alone, so running it again never
  overwrites what an admin has edited.
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
  const p = await tx
    .insert(products)
    .values(
      rawProducts.map((raw, i) => ({
        id: raw.id,
        slug: raw.slug,
        categorySlug: raw.categorySlug,
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
  return { categories: c.length, brands: b.length, products: p.length };
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
