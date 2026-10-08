import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories, orders, products, type OrderStatus } from "@/lib/db/schema";
import { contentToForm } from "./product-form";
import type { ProductFormValues } from "@/components/admin/ProductForm";

export async function listCategories() {
  return getDb().select().from(categories).orderBy(asc(categories.sort), asc(categories.slug));
}

export async function listBrands() {
  return getDb().select().from(brands).orderBy(asc(brands.sort), asc(brands.name));
}

export async function listProducts(q?: string) {
  const db = getDb();
  const term = q?.trim();
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: sql<string>`${products.content}->'name'->>'uz'`,
      categorySlug: products.categorySlug,
      brandSlug: products.brandSlug,
      price: products.price,
      oldPrice: products.oldPrice,
      inStock: products.inStock,
      kind: products.kind,
      images: products.images,
      cutout: products.cutout,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(
      term
        ? or(
            ilike(products.slug, `%${term}%`),
            sql`${products.content}->'name'->>'uz' ilike ${`%${term}%`}`,
            sql`${products.content}->'name'->>'ru' ilike ${`%${term}%`}`,
          )
        : undefined,
    )
    .orderBy(asc(products.sort), asc(products.createdAt));
}

export async function productFormValues(id: string): Promise<ProductFormValues | null> {
  const [p] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    categorySlug: p.categorySlug ?? "",
    brandSlug: p.brandSlug ?? "",
    price: String(p.price),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
    inStock: p.inStock,
    kind: p.kind,
    sort: String(p.sort),
    images: p.images.join("\n"),
    cutout: p.cutout ?? "",
    unitCount: p.unit ? String(p.unit.count) : "",
    unitKind: p.unit?.unit ?? "",
    content: contentToForm(p.content),
  };
}

export const EMPTY_PRODUCT: ProductFormValues = {
  slug: "",
  categorySlug: "",
  brandSlug: "",
  price: "",
  oldPrice: "",
  inStock: true,
  kind: "core",
  sort: "0",
  images: "",
  cutout: "",
  unitCount: "",
  unitKind: "",
  content: {},
};

export async function listOrders({ status, limit = 100 }: { status?: OrderStatus; limit?: number } = {}) {
  return getDb()
    .select()
    .from(orders)
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrder(number: string) {
  const [o] = await getDb().select().from(orders).where(eq(orders.number, number)).limit(1);
  return o ?? null;
}

export async function orderStats() {
  const db = getDb();
  const [row] = await db
    .select({
      today: sql<number>`count(*) filter (where ${orders.createdAt} >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent')`,
      week: sql<number>`count(*) filter (where ${orders.createdAt} >= now() - interval '7 days')`,
      weekRevenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.createdAt} >= now() - interval '7 days' and ${orders.status} <> 'cancelled'), 0)`,
      open: sql<number>`count(*) filter (where ${orders.status} in ('new', 'confirmed'))`,
    })
    .from(orders);
  return {
    today: Number(row?.today ?? 0),
    week: Number(row?.week ?? 0),
    weekRevenue: Number(row?.weekRevenue ?? 0),
    open: Number(row?.open ?? 0),
  };
}
