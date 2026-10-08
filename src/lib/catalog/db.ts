import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories, orders, products } from "@/lib/db/schema";
import { builtInCatalog, type RawProduct } from "@/lib/shopflow/mock";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";
import type { CatalogData } from "./engine";

export const CATALOG_TAG = "catalog";

const EMPTY_REVIEWS = { uz: [], ru: [] };

async function readCatalog(): Promise<CatalogData> {
  const db = getDb();
  const [cats, brandRows, rows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort), asc(categories.slug)),
    db.select().from(brands).orderBy(asc(brands.sort), asc(brands.name)),
    db.select().from(products).orderBy(asc(products.sort), asc(products.createdAt)),
  ]);
  const categoryId = new Map(cats.map((c) => [c.slug, c.id]));
  return {
    categories: cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image ?? "/images/stock/st-cat-capsules.webp",
    })),
    brands: brandRows.map((b) => ({ slug: b.slug, name: b.name })),
    products: rows.map(
      (p): RawProduct => ({
        ...p.content,
        id: p.id,
        slug: p.slug,
        categoryId: (p.categorySlug && categoryId.get(p.categorySlug)) || "",
        categorySlug: p.categorySlug ?? "",
        price: p.price,
        oldPrice: p.oldPrice ?? undefined,
        rating: 0,
        reviewCount: 0,
        inStock: p.inStock,
        imageSeeds: [],
        bespoke: false,
        kind: p.kind,
        reviews: EMPTY_REVIEWS,
        images: p.images,
        cutout: p.cutout,
        unit: p.unit,
        brandSlug: p.brandSlug,
      }),
    ),
    // Promotions are not admin-managed yet; the site-wide ones stay in code.
    promotions: builtInCatalog.promotions,
  };
}

const cachedCatalog = unstable_cache(readCatalog, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 300 });

/*
  Never an empty shop. If the database cannot be read, or holds no products
  yet (before the first import from the admin panel), the built-in catalogue
  is served and the failure is logged — the 2026-10 outage was exactly a
  catalogue source that answered "nothing" and a site that believed it.
*/
export async function loadDbCatalog(): Promise<CatalogData> {
  try {
    const data = await cachedCatalog();
    if (data.products.length === 0) {
      console.warn("[catalog] database has no products yet — serving the built-in catalogue");
      return builtInCatalog;
    }
    return data;
  } catch (err) {
    console.error("[catalog] database read failed — serving the built-in catalogue:", (err as Error).message);
    return builtInCatalog;
  }
}

/** Every order lands in the database first; Telegram is the alert, not the record. */
export async function saveOrderToDb(payload: OrderRequest): Promise<OrderResult> {
  try {
    const [row] = await getDb()
      .insert(orders)
      .values({
        total: payload.totals.total,
        customer: payload.customer,
        delivery: payload.delivery,
        payment: payload.payment,
        items: payload.items,
        totals: payload.totals,
        locale: payload.locale,
        attribution: payload.attribution,
      })
      .returning({ number: orders.number });
    return { ok: true, orderId: row.number ?? undefined };
  } catch (err) {
    console.error("[orders] insert failed:", (err as Error).message);
    return { ok: false, message: "Order could not be saved." };
  }
}
