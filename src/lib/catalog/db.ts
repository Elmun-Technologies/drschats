import { unstable_cache } from "next/cache";
import { asc, count, gt, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { brands, categories, deals, orders, products, promotions } from "@/lib/db/schema";
import { builtInCatalog, type RawProduct, type RawPromotion } from "@/lib/shopflow/mock";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";
import type { CatalogData } from "./engine";
import { createCircuit } from "./circuit";
import type { RawDeal } from "./deals";

export const CATALOG_TAG = "catalog";

const EMPTY_REVIEWS = { uz: [], ru: [] };

/*
  Admin-managed promotions. With no rows yet the built-in ones apply; once the
  team has any row, the table is the whole truth — an empty active set means
  "no promotions right now", not "fall back to code".
*/
async function readPromotions(): Promise<RawPromotion[]> {
  let rows: (typeof promotions.$inferSelect)[];
  try {
    rows = await getDb().select().from(promotions).orderBy(asc(promotions.sort), asc(promotions.createdAt));
  } catch (err) {
    console.error("[catalog] promotions read failed — using the built-in ones:", (err as Error).message);
    return builtInCatalog.promotions;
  }
  if (rows.length === 0) return builtInCatalog.promotions;
  const now = Date.now();
  return rows
    .filter((r) => r.active && (!r.startsAt || r.startsAt.getTime() <= now) && (!r.endsAt || r.endsAt.getTime() > now))
    .map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      ...(r.percent != null ? { percent: r.percent } : {}),
      ...(r.threshold != null ? { threshold: r.threshold } : {}),
      ...(r.productSlugs && r.productSlugs.length > 0 ? { productSlugs: r.productSlugs } : {}),
    }));
}

/*
  Deals that have not ended yet, current and upcoming. Which one applies is
  decided per read with the clock of that read (catalog/deals.ts), so a deal
  cached here before its start still begins on time.
*/
async function readDeals(): Promise<RawDeal[]> {
  try {
    const rows = await getDb().select().from(deals).where(gt(deals.endsAt, sql`now()`)).orderBy(asc(deals.startsAt));
    return rows.map((d) => ({
      id: d.id,
      productSlug: d.productSlug,
      percent: d.percent,
      price: d.price,
      startsAt: d.startsAt.toISOString(),
      endsAt: d.endsAt.toISOString(),
    }));
  } catch (err) {
    console.error("[catalog] deals read failed — no deal of the day:", (err as Error).message);
    return [];
  }
}

async function readCatalog(): Promise<CatalogData> {
  const db = getDb();
  const [cats, brandRows, rows, promos, dealRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort), asc(categories.slug)),
    db.select().from(brands).orderBy(asc(brands.sort), asc(brands.name)),
    db.select().from(products).orderBy(asc(products.sort), asc(products.createdAt)),
    readPromotions(),
    readDeals(),
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
        saleEndsAt: p.saleEndsAt ? p.saleEndsAt.toISOString() : undefined,
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
    promotions: promos,
    deals: dealRows,
  };
}

const cachedCatalog = unstable_cache(readCatalog, ["catalog-v3"], { tags: [CATALOG_TAG], revalidate: 60 });

/*
  Never an empty shop. If the database cannot be read, or holds no products
  yet (before the first import from the admin panel), the built-in catalogue
  is served and the failure is logged — the 2026-10 outage was exactly a
  catalogue source that answered "nothing" and a site that believed it.

  After a failed read the database is left alone for 30 seconds: during an
  outage every request would otherwise wait out the connection timeout again
  before falling back.
*/
const dbCircuit = createCircuit(30_000);

export async function loadDbCatalog(): Promise<CatalogData> {
  if (dbCircuit.isOpen()) return builtInCatalog;
  try {
    const data = await cachedCatalog();
    dbCircuit.succeed();
    if (data.products.length === 0) {
      console.warn("[catalog] database has no products yet — serving the built-in catalogue");
      return builtInCatalog;
    }
    return data;
  } catch (err) {
    dbCircuit.fail();
    console.error("[catalog] database read failed — serving the built-in catalogue:", (err as Error).message);
    return builtInCatalog;
  }
}

/** Current and upcoming deals of the day, from the same cached read the prices come from. */
export async function loadDeals(): Promise<RawDeal[]> {
  return (await loadDbCatalog()).deals ?? [];
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

/**
 * Orders already placed from this phone number (matched on its last 9 digits,
 * so "+998 90 …" and "90 …" are one customer), including the one just saved.
 * Null without a database — the operator then checks by hand.
 */
export async function ordersFromPhone(phone: string): Promise<number | null> {
  const digits = phone.replace(/\D/g, "").slice(-9);
  if (!isDbConfigured || digits.length < 9) return null;
  try {
    const [row] = await getDb()
      .select({ n: count() })
      .from(orders)
      .where(sql`right(regexp_replace(${orders.customer}->>'phone', '\\D', '', 'g'), 9) = ${digits}`);
    return row?.n ?? 0;
  } catch (err) {
    console.error("[orders] phone lookup failed:", (err as Error).message);
    return null;
  }
}
