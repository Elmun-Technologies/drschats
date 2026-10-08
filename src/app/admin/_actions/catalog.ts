"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { brands, categories, products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { rawCategories, rawProducts } from "@/lib/shopflow/mock";
import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";
import { PRODUCT_CUTOUTS, categoryCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS } from "@/lib/content/product-units";
import { ALL_BRANDS, productBrand } from "@/lib/content/product-brands";
import { SLUG_RE, formToContent, parseImages, productFieldsSchema } from "@/lib/admin/product-form";
import { isStorageConfigured, uploadImage } from "@/lib/admin/storage";
import { isAllowedImageUrl } from "@/lib/security/csp";

export type FormState = { error?: string; ok?: string } | undefined;

/*
  The catalogue feeds every page (header menus, rails, cart prices), and a
  prerendered page does not carry the data-cache tag — so both the tag and
  the whole route cache are dropped. Pages rebuild on their next request.
*/
function refresh() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

function formObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

function firstIssue(err: z.ZodError) {
  return err.issues[0]?.message ?? "Maydonlarni tekshiring.";
}

/* ─── Import ─────────────────────────────────────────────────────────────── */

/*
  Copies the built-in catalogue into the database. Insert-only: a row that is
  already there (by slug) is left alone, so running it again never overwrites
  what an admin has edited.
*/
export async function importBuiltInCatalog(_state?: FormState, _form?: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const result = await db.transaction(async (tx) => {
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
  });
  refresh();
  return { ok: `Import qilindi: ${result.products} ta mahsulot, ${result.categories} ta kategoriya, ${result.brands} ta brend. Mavjudlari oʻzgartirilmadi.` };
}

/* ─── Products ───────────────────────────────────────────────────────────── */

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = formObject(form);
  const parsed = productFieldsSchema.safeParse(data);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const id = data.id?.trim() || `p-${d.slug}`;
  const rejected = [...(d.images ?? "").split(/\r?\n/), d.cutout ?? ""]
    .map((u) => u.trim())
    .filter((u) => u && !isAllowedImageUrl(u));
  if (rejected.length > 0) {
    return { error: `Bu rasm manzili saytda chiqmaydi (ruxsat etilmagan host): ${rejected[0]}. Rasmni «Rasm yuklash» orqali yuklang.` };
  }

  const unit =
    d.unitCount && d.unitKind ? { count: Number(d.unitCount), unit: d.unitKind as "tablet" | "capsule" } : null;
  const row = {
    slug: d.slug,
    categorySlug: d.categorySlug,
    brandSlug: d.brandSlug || null,
    price: d.price,
    oldPrice: d.oldPrice === "" || d.oldPrice == null ? null : Number(d.oldPrice),
    inStock: d.inStock === "on",
    kind: d.kind,
    sort: d.sort,
    images: parseImages(d.images),
    cutout: d.cutout && isAllowedImageUrl(d.cutout) ? d.cutout : null,
    unit,
    content: formToContent(data),
    updatedAt: new Date(),
  };

  const db = getDb();
  const [clash] = await db.select({ id: products.id }).from(products).where(eq(products.slug, d.slug)).limit(1);
  if (clash && clash.id !== id) return { error: `«${d.slug}» slug boshqa mahsulotda band.` };

  await db
    .insert(products)
    .values({ id, ...row })
    .onConflictDoUpdate({ target: products.id, set: row });
  refresh();
  if (!data.id) redirect(`/admin/products/${encodeURIComponent(id)}?saved=1`);
  return { ok: "Saqlandi. Saytda 1 daqiqa ichida yangilanadi." };
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (id) await getDb().delete(products).where(eq(products.id, id));
  refresh();
  redirect("/admin/products?deleted=1");
}

export async function uploadProductImage(_: FormState, form: FormData): Promise<FormState & { url?: string }> {
  await requireAdmin();
  if (!isStorageConfigured) return { error: "Rasm saqlash (Tigris) sozlanmagan — URL manzilini qoʻlda kiriting." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Fayl tanlanmagan." };
  try {
    const url = await uploadImage(file, "products");
    return { ok: "Yuklandi.", url };
  } catch (err) {
    const code = (err as Error).message;
    return {
      error:
        code === "too-large" ? "Fayl 5 MB dan katta." : code === "unsupported-type" ? "Faqat JPG, PNG, WebP yoki AVIF." : "Yuklab boʻlmadi.",
    };
  }
}

/* ─── Categories ─────────────────────────────────────────────────────────── */

const categorySchema = z.object({
  slug: z.string().trim().regex(SLUG_RE, "slug: faqat kichik lotin harflari, raqam va «-»"),
  "uz.name": z.string().trim().min(2, "Nomi (uz) majburiy"),
  "ru.name": z.string().trim().min(2, "Nomi (ru) majburiy"),
  "uz.description": z.string().trim().max(400).default(""),
  "ru.description": z.string().trim().max(400).default(""),
  image: z.string().trim().optional(),
  sort: z.coerce.number().int().default(0),
});

export async function saveCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = formObject(form);
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const original = data.original?.trim();
  const row = {
    slug: d.slug,
    name: { uz: d["uz.name"], ru: d["ru.name"] },
    description: { uz: d["uz.description"], ru: d["ru.description"] },
    image: d.image && isAllowedImageUrl(d.image) ? d.image : null,
    sort: d.sort,
    updatedAt: new Date(),
  };
  const db = getDb();
  if (original) {
    // slug changes cascade to products (on update cascade).
    await db.update(categories).set(row).where(eq(categories.slug, original));
  } else {
    const [exists] = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, d.slug)).limit(1);
    if (exists) return { error: `«${d.slug}» kategoriyasi allaqachon bor.` };
    await db.insert(categories).values({ id: `cat-${d.slug}`, ...row });
  }
  refresh();
  return { ok: "Saqlandi." };
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  const db = getDb();
  const [{ n }] = await db.select({ n: count() }).from(products).where(eq(products.categorySlug, slug));
  if (n === 0) await db.delete(categories).where(eq(categories.slug, slug));
  refresh();
  redirect(n === 0 ? "/admin/categories?deleted=1" : "/admin/categories?blocked=1");
}

/* ─── Brands ─────────────────────────────────────────────────────────────── */

const brandSchema = z.object({
  slug: z.string().trim().regex(SLUG_RE, "slug: faqat kichik lotin harflari, raqam va «-»"),
  name: z.string().trim().min(2).max(80),
  sort: z.coerce.number().int().default(0),
});

export async function saveBrand(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = brandSchema.safeParse(formObject(form));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  await getDb()
    .insert(brands)
    .values(parsed.data)
    .onConflictDoUpdate({ target: brands.slug, set: { name: parsed.data.name, sort: parsed.data.sort } });
  refresh();
  return { ok: "Saqlandi." };
}

export async function deleteBrand(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  // Products keep existing; their brand is cleared (on delete set null).
  await getDb().delete(brands).where(eq(brands.slug, slug));
  refresh();
  redirect("/admin/brands?deleted=1");
}

/** Cheap counts for the dashboard. */
export async function catalogCounts() {
  const db = getDb();
  const [[p], [c], [b], [hidden]] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(brands),
    db.select({ n: count() }).from(products).where(sql`${products.kind} = 'unlisted' or ${products.inStock} = false`),
  ]);
  return { products: p.n, categories: c.n, brands: b.n, hidden: hidden.n };
}
