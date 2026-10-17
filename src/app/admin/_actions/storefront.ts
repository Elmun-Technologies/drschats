"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { banners, deals, products, siteSettings } from "@/lib/db/schema";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { MERCH_TAG } from "@/lib/merch/store";
import { ANNOUNCEMENTS_KEY, MAX_ANNOUNCEMENTS, safeHref, type Announcement } from "@/lib/merch/model";
import { discounted } from "@/lib/catalog/deals";
import { livePrice } from "@/lib/shop/sale";
import { fromTashkentInput } from "@/lib/admin/product-form";
import { requireAdmin } from "@/lib/admin/session";
import { EXPERIMENT_RE } from "@/lib/merch/ab";
import type { FormState } from "./catalog";

/*
  Admin → Vitrina. Every save drops the storefront's merchandising cache and
  the route cache, so the hero, the strip, the announcement bar and the deal
  of the day change on the next page view.
*/
function refreshStorefront({ catalog = false } = {}) {
  revalidateTag(MERCH_TAG);
  if (catalog) revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/storefront", "layout");
}

const strings = (form: FormData) =>
  Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

/* ─── Banners ───────────────────────────────────────────────────────────── */

const imagePath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^\/[^/\\]/.test(v) || /^https:\/\//i.test(v), "Rasm manzili / yoki https:// bilan boshlansin.");

const bannerSchema = z.object({
  placement: z.enum(["hero", "strip", "category"]),
  "uz.title": z.string().trim().min(2, "Sarlavha (uz) majburiy").max(90, "Sarlavha 90 belgidan oshmasin"),
  "ru.title": z.string().trim().min(2, "Sarlavha (ru) majburiy").max(90, "Sarlavha 90 belgidan oshmasin"),
  "uz.subtitle": z.string().trim().max(160).default(""),
  "ru.subtitle": z.string().trim().max(160).default(""),
  "uz.cta": z.string().trim().max(30).default(""),
  "ru.cta": z.string().trim().max(30).default(""),
  href: z.string().trim().min(1, "Havolani kiriting."),
  image: imagePath.default(""),
  imageMobile: imagePath.default(""),
  theme: z.enum(["light", "dark"]).default("light"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  sort: z.coerce.number().int().min(-999).max(999).default(0),
  // A/B test (lib/merch/ab.ts): both empty, or a key and a variant.
  experiment: z
    .string()
    .trim()
    .toLowerCase()
    .max(40)
    .refine((v) => v === "" || EXPERIMENT_RE.test(v), "Tajriba kaliti: lotin harflari, raqam va «-» (masalan: hero-oktabr).")
    .default(""),
  variant: z.enum(["", "A", "B"]).default(""),
});

export async function saveBanner(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = strings(form);
  const parsed = bannerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const d = parsed.data;
  const href = safeHref(d.href);
  if (!href) return { error: "Havola saytdagi yoʻl (/product/…) yoki https:// manzil boʻlsin." };
  if (Boolean(d["uz.cta"]) !== Boolean(d["ru.cta"])) return { error: "Tugma matnini ikkala tilda yozing yoki ikkalasini boʻsh qoldiring." };
  const startsAt = fromTashkentInput(d.startsAt);
  const endsAt = fromTashkentInput(d.endsAt);
  if (d.startsAt && !startsAt) return { error: "Boshlanish sanasini toʻliq kiriting." };
  if (d.endsAt && !endsAt) return { error: "Tugash sanasini toʻliq kiriting." };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "Tugash sanasi boshlanishdan keyin boʻlsin." };
  if (Boolean(d.experiment) !== Boolean(d.variant)) return { error: "A/B test uchun tajriba kalitini ham, variantni ham tanlang (yoki ikkalasini boʻsh qoldiring)." };
  const experiment = d.experiment || null;
  const variant = d.variant || null;
  if (experiment && variant) {
    const others = await getDb()
      .select({ id: banners.id, variant: banners.variant, placement: banners.placement })
      .from(banners)
      .where(and(eq(banners.experiment, experiment), ne(banners.id, Number(data.id) || 0)));
    if (others.some((o) => o.variant === variant)) return { error: `«${experiment}» tajribasida ${variant} varianti allaqachon bor.` };
    if (others.some((o) => o.placement !== d.placement)) return { error: "Tajribaning ikkala varianti bir joyda (bitta joylashuvda) boʻlsin." };
  }
  const showCountdown = form.get("showCountdown") === "on";
  // A countdown is only ever a real end date.
  if (showCountdown && !endsAt) return { error: "Taymer faqat tugash sanasi bor bannerda koʻrsatiladi." };

  const row = {
    placement: d.placement,
    title: { uz: d["uz.title"], ru: d["ru.title"] },
    subtitle: { uz: d["uz.subtitle"], ru: d["ru.subtitle"] },
    cta: { uz: d["uz.cta"], ru: d["ru.cta"] },
    href,
    image: d.image || null,
    imageMobile: d.imageMobile || null,
    theme: d.theme,
    startsAt,
    endsAt,
    showCountdown,
    sort: d.sort,
    active: form.get("active") === "on",
    experiment,
    variant,
    updatedAt: new Date(),
  };
  const db = getDb();
  const id = Number(data.id);
  if (id) {
    const updated = await db.update(banners).set(row).where(eq(banners.id, id)).returning({ id: banners.id });
    if (updated.length === 0) return { error: "Banner topilmadi." };
  } else {
    await db.insert(banners).values(row);
    // «+ B variant»: the banner it was started from becomes the other arm, if it is not in a test yet.
    const pairWith = Number(data.pairWith);
    if (experiment && variant && Number.isSafeInteger(pairWith) && pairWith > 0) {
      await db
        .update(banners)
        .set({ experiment, variant: variant === "A" ? "B" : "A", updatedAt: new Date() })
        .where(and(eq(banners.id, pairWith), sql`${banners.experiment} is null`, eq(banners.placement, d.placement)));
    }
  }
  refreshStorefront();
  if (!id) redirect("/admin/storefront?saved=1");
  return { ok: "Saqlandi. Saytda darhol koʻrinadi." };
}

export async function toggleBanner(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await getDb().update(banners).set({ active: sql`not ${banners.active}`, updatedAt: new Date() }).where(eq(banners.id, id));
  refreshStorefront();
}

export async function deleteBanner(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await getDb().delete(banners).where(eq(banners.id, id));
  refreshStorefront();
  redirect("/admin/storefront?deleted=1");
}

/* ─── Announcement bar ──────────────────────────────────────────────────── */

/*
  The form posts rows as `a.<n>.<field>`; rows with no text in either
  language are dropped (that is how a row is removed).
*/
export async function saveAnnouncements(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const data = strings(form);
  const rows = new Map<string, Record<string, string>>();
  for (const [key, value] of Object.entries(data)) {
    const m = key.match(/^a\.(\d{1,2})\.(\w+)$/);
    if (!m) continue;
    rows.set(m[1], { ...rows.get(m[1]), [m[2]]: value });
  }
  const items: Announcement[] = [];
  for (const [n, r] of [...rows].sort(([a], [b]) => Number(a) - Number(b))) {
    const uz = (r.uz ?? "").trim();
    const ru = (r.ru ?? "").trim();
    if (!uz && !ru) continue;
    if (!uz || !ru) return { error: `${items.length + 1}-qator: matnni ikkala tilda yozing.` };
    if (uz.length > 140 || ru.length > 140) return { error: `${items.length + 1}-qator: matn 140 belgidan oshmasin.` };
    const rawHref = (r.href ?? "").trim();
    const href = rawHref ? safeHref(rawHref) : null;
    if (rawHref && !href) return { error: `${items.length + 1}-qator: havola /… yoki https:// bilan boshlansin.` };
    const ends = fromTashkentInput(r.endsAt);
    if (r.endsAt && !ends) return { error: `${items.length + 1}-qator: tugash vaqtini toʻliq kiriting.` };
    const showCountdown = form.get(`a.${n}.showCountdown`) === "on";
    if (showCountdown && !ends) return { error: `${items.length + 1}-qator: taymer faqat tugash vaqti bilan.` };
    items.push({
      id: /^[a-z0-9]{4,40}$/.test(r.id ?? "") ? r.id : randomBytes(4).toString("hex"),
      text: { uz, ru },
      href,
      endsAt: ends ? ends.toISOString() : null,
      showCountdown,
      active: form.get(`a.${n}.active`) === "on",
    });
  }
  if (items.length > MAX_ANNOUNCEMENTS) return { error: `Koʻpi bilan ${MAX_ANNOUNCEMENTS} ta eʼlon.` };

  const db = getDb();
  if (items.length === 0) {
    await db.delete(siteSettings).where(eq(siteSettings.key, ANNOUNCEMENTS_KEY));
  } else {
    const value = JSON.stringify(items);
    await db
      .insert(siteSettings)
      .values({ key: ANNOUNCEMENTS_KEY, value, updatedBy: admin.id })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: admin.id, updatedAt: new Date() } });
  }
  refreshStorefront();
  return { ok: items.length ? "Saqlandi. Eʼlon qatori saytda yangilandi." : "Eʼlonlar olib tashlandi — saytda odatiy qator koʻrinadi." };
}

/* ─── Deal of the day ───────────────────────────────────────────────────── */

const dealSchema = z.object({
  productSlug: z.string().trim().min(1, "Mahsulotni tanlang."),
  mode: z.enum(["percent", "price"]),
  percent: z.string().trim().default(""),
  price: z.string().trim().default(""),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function saveDeal(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const data = strings(form);
  const parsed = dealSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const d = parsed.data;
  const percent = d.mode === "percent" ? Number(d.percent) : null;
  const price = d.mode === "price" ? Number(d.price.replace(/\s/g, "")) : null;
  if (percent !== null && (!Number.isInteger(percent) || percent < 1 || percent > 90)) return { error: "Chegirma foizi 1 dan 90 gacha boʻlsin." };
  if (price !== null && (!Number.isInteger(price) || price <= 0)) return { error: "Narxni soʻmda butun son bilan kiriting." };

  const startsAt = fromTashkentInput(d.startsAt) ?? new Date();
  const endsAt = fromTashkentInput(d.endsAt);
  if (!endsAt) return { error: "Tugash vaqtini kiriting." };
  if (endsAt <= startsAt) return { error: "Tugash vaqti boshlanishdan keyin boʻlsin." };
  if (endsAt.getTime() <= Date.now()) return { error: "Tugash vaqti oʻtib ketgan." };

  const db = getDb();
  const [product] = await db
    .select({ slug: products.slug, price: products.price, oldPrice: products.oldPrice, saleEndsAt: products.saleEndsAt, inStock: products.inStock, kind: products.kind })
    .from(products)
    .where(eq(products.slug, d.productSlug))
    .limit(1);
  if (!product) return { error: "Mahsulot topilmadi." };
  if (!product.inStock || product.kind === "unlisted") return { error: "Bu mahsulot hozir sotuvda emas." };
  // The price it sells at today (an expired product sale already reverted).
  const base = livePrice({ price: product.price, oldPrice: product.oldPrice ?? undefined, saleEndsAt: product.saleEndsAt?.toISOString() }).price;
  if (discounted(base, { percent, price }) == null) {
    return { error: `Taklif narxi hozirgi narxdan (${base.toLocaleString("ru-RU")} soʻm) past boʻlishi kerak.` };
  }

  const id = Number(data.id);
  const row = { productSlug: product.slug, percent, price, startsAt, endsAt, updatedAt: new Date() };
  try {
    if (id) {
      const updated = await db.update(deals).set(row).where(eq(deals.id, id)).returning({ id: deals.id });
      if (updated.length === 0) return { error: "Taklif topilmadi." };
    } else {
      await db.insert(deals).values({ ...row, createdBy: admin.id });
    }
  } catch (err) {
    // deals_no_overlap: one deal of the day at a time.
    const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string; constraint_name?: string } };
    const text = [e.code, e.message, e.cause?.code, e.cause?.message, e.cause?.constraint_name].join(" ");
    if (/deals_no_overlap|23P01/.test(text)) {
      return { error: "Bu vaqtda boshqa taklif bor. Vaqtni oʻzgartiring yoki avvalgisini oʻchiring." };
    }
    throw err;
  }
  refreshStorefront({ catalog: true });
  if (!id) redirect("/admin/storefront/deal?saved=1");
  return { ok: "Saqlandi." };
}

export async function deleteDeal(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) await getDb().delete(deals).where(eq(deals.id, id));
  refreshStorefront({ catalog: true });
  redirect("/admin/storefront/deal?deleted=1");
}

/* Ends the running deal now: the product's usual price is back on the next page view. */
export async function endDealNow(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (id) {
    await getDb()
      .update(deals)
      .set({ endsAt: sql`greatest(now(), ${deals.startsAt} + interval '1 second')`, updatedAt: new Date() })
      .where(eq(deals.id, id));
  }
  refreshStorefront({ catalog: true });
  redirect("/admin/storefront/deal?ended=1");
}
