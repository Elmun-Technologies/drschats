"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { brands, categories, products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { builtInCatalogStatus, dismissBuiltInImport, insertBuiltInCatalog } from "@/lib/admin/seed";
import { dismissKeysOf } from "@/lib/admin/catalog-sync";
import { slugify } from "@/lib/admin/slugify";
import { SLUG_RE, formToContent, fromTashkentInput, parseImages, productFieldsSchema } from "@/lib/admin/product-form";
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
  Brings over anything from the built-in catalogue the database lacks and
  fills photos only where a matching product has none; never overwrites.
  Answers with a redirect carrying the counts, because the prompt that holds
  the button disappears once nothing is missing.
*/
export async function importBuiltInCatalog(_form?: FormData) {
  await requireAdmin();
  const r = await getDb().transaction((tx) => insertBuiltInCatalog(tx));
  refresh();
  const counts = [r.products, r.categories, r.brands, r.imagesFilled, r.categoryImagesFilled].join(".");
  redirect(`/admin/products?imported=${counts}`);
}

/* "Kerak emas": what is missing now stops being offered (a product the team deleted on purpose). */
export async function dismissBuiltInImportAction(_form?: FormData) {
  await requireAdmin();
  const { diff } = await builtInCatalogStatus();
  await dismissBuiltInImport(dismissKeysOf(diff));
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/* ─── Products ───────────────────────────────────────────────────────────── */

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = formObject(form);
  // Brand names rarely differ between languages; an empty Russian name takes the Uzbek one.
  if (!data["ru.name"]?.trim() && data["uz.name"]?.trim()) data["ru.name"] = data["uz.name"];
  const parsed = productFieldsSchema.safeParse(data);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const editingId = data.id?.trim() || null;
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
    // An end date only means something on a real sale (an old price to return to).
    saleEndsAt: d.oldPrice === "" || d.oldPrice == null ? null : fromTashkentInput(d.saleEndsAt),
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
  if (clash && clash.id !== editingId) return { error: `«${d.slug}» slug boshqa mahsulotda band.` };

  if (editingId) {
    const updated = await db.update(products).set(row).where(eq(products.id, editingId)).returning({ id: products.id });
    if (updated.length === 0) return { error: "Mahsulot topilmadi — u boshqa oynada oʻchirilgan boʻlishi mumkin." };
    refresh();
    return { ok: "Saqlandi. Saytda darhol yangilanadi." };
  }

  /*
    A new product never takes over an existing row. Ids follow p-<slug>, and a
    product whose slug was later renamed still holds its old id — an upsert
    on that id silently replaced it.
  */
  const [taken] = await db.select({ id: products.id }).from(products).where(eq(products.id, `p-${d.slug}`)).limit(1);
  const id = taken ? `p-${d.slug}-${randomBytes(3).toString("hex")}` : `p-${d.slug}`;
  await db.insert(products).values({ id, ...row });
  refresh();
  redirect(`/admin/products/${encodeURIComponent(id)}?saved=1`);
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (id) await getDb().delete(products).where(eq(products.id, id));
  refresh();
  redirect("/admin/products?deleted=1");
}

/* A copy to start a similar product from; hidden until the team edits and publishes it. */
export async function duplicateProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const db = getDb();
  const [source] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!source) redirect("/admin/products");
  const suffix = randomBytes(2).toString("hex");
  const slug = `${source.slug}-nusxa-${suffix}`.slice(0, 120);
  const newId = `p-${slug}`;
  await db.insert(products).values({
    ...source,
    id: newId,
    slug,
    kind: "unlisted",
    content: { ...source.content, name: { uz: `${source.content.name.uz} (nusxa)`, ru: `${source.content.name.ru} (копия)` } },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  refresh();
  redirect(`/admin/products/${encodeURIComponent(newId)}?copied=1`);
}

export async function toggleProductStock(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const db = getDb();
  const [row] = await db.select({ inStock: products.inStock }).from(products).where(eq(products.id, id)).limit(1);
  if (row) await db.update(products).set({ inStock: !row.inStock, updatedAt: new Date() }).where(eq(products.id, id));
  refresh();
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
  "uz.name": z.string().trim().min(2, "Nomi (uz) majburiy").max(80),
  "ru.name": z.string().trim().min(2, "Nomi (ru) majburiy").max(80),
  "uz.description": z.string().trim().max(400).default(""),
  "ru.description": z.string().trim().max(400).default(""),
  image: z.string().trim().optional(),
  sort: z.coerce.number().int().min(-10000).max(10000).default(0),
});

type CategoryInput = z.infer<typeof categorySchema>;

/* An empty slug comes from the Uzbek name, exactly as the form previews it. */
function parseCategory(data: Record<string, string>): { error: string } | { data: CategoryInput } {
  const parsed = categorySchema.safeParse({ ...data, slug: data.slug?.trim() || slugify(data["uz.name"] ?? "") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  // /admin/categories/new is the creation page; a category called "new" could never be opened.
  if (parsed.data.slug === "new") return { error: "«new» slug band — boshqa nom tanlang." };
  const image = parsed.data.image;
  if (image && !isAllowedImageUrl(image)) {
    return { error: `Bu rasm manzili saytda chiqmaydi (ruxsat etilmagan host): ${image}. Roʻyxatdan tanlang yoki yuklang.` };
  }
  return { data: parsed.data };
}

function categoryRow(d: CategoryInput) {
  return {
    slug: d.slug,
    name: { uz: d["uz.name"], ru: d["ru.name"] },
    description: { uz: d["uz.description"], ru: d["ru.description"] },
    image: d.image || null,
    sort: d.sort,
    updatedAt: new Date(),
  };
}

/* Inserts a new category; answers with the clash message when the slug is taken. */
async function insertCategory(d: CategoryInput): Promise<string | null> {
  const db = getDb();
  const [exists] = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, d.slug)).limit(1);
  if (exists) return `«${d.slug}» kategoriyasi allaqachon bor.`;
  const [idTaken] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, `cat-${d.slug}`)).limit(1);
  await db.insert(categories).values({ id: idTaken ? `cat-${d.slug}-${randomBytes(3).toString("hex")}` : `cat-${d.slug}`, ...categoryRow(d) });
  return null;
}

export async function saveCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = formObject(form);
  const parsed = parseCategory(data);
  if ("error" in parsed) return { error: parsed.error };
  const d = parsed.data;
  const original = data.original?.trim();

  if (!original) {
    const clash = await insertCategory(d);
    if (clash) return { error: clash };
    refresh();
    redirect(`/admin/categories?created=${encodeURIComponent(d.slug)}`);
  }

  const db = getDb();
  if (d.slug !== original) {
    const [exists] = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, d.slug)).limit(1);
    if (exists) return { error: `«${d.slug}» kategoriyasi allaqachon bor.` };
  }
  // slug changes cascade to products (on update cascade).
  const updated = await db.update(categories).set(categoryRow(d)).where(eq(categories.slug, original)).returning({ slug: categories.slug });
  if (updated.length === 0) return { error: "Kategoriya topilmadi — u boshqa oynada oʻchirilgan boʻlishi mumkin." };
  refresh();
  if (d.slug !== original) redirect(`/admin/categories/${encodeURIComponent(d.slug)}?saved=1`);
  return { ok: "Saqlandi. Saytda darhol yangilanadi." };
}

/* The product form's "+ Yangi kategoriya": creates it and hands back the slug to select. */
export async function quickCreateCategory(form: FormData): Promise<{ error?: string; slug?: string; name?: string }> {
  await requireAdmin();
  const parsed = parseCategory(formObject(form));
  if ("error" in parsed) return { error: parsed.error };
  const clash = await insertCategory(parsed.data);
  if (clash) return { error: clash };
  refresh();
  return { slug: parsed.data.slug, name: parsed.data["uz.name"] };
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  const db = getDb();
  const [{ n }] = await db.select({ n: count() }).from(products).where(eq(products.categorySlug, slug));
  if (n === 0) await db.delete(categories).where(eq(categories.slug, slug));
  refresh();
  redirect(n === 0 ? "/admin/categories?deleted=1" : `/admin/categories/${encodeURIComponent(slug)}?blocked=1`);
}

/* ─── Brands ─────────────────────────────────────────────────────────────── */

const brandSchema = z.object({
  slug: z.string().trim().regex(SLUG_RE, "slug: faqat kichik lotin harflari, raqam va «-»"),
  name: z.string().trim().min(2).max(80),
  sort: z.coerce.number().int().default(0),
});

export async function saveBrand(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = formObject(form);
  const parsed = brandSchema.safeParse({ ...data, slug: data.slug?.trim() || slugify(data.name ?? "") });
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
