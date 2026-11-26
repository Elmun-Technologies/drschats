import "server-only";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { ORDER_STATUSES, products, promoCodes } from "@/lib/db/schema";
import type { AdminUser } from "@/lib/admin/session";
import type { Permission } from "@/lib/admin/roles";
import { getOrder, listBrands, listCategories, listOrders, listProducts, orderStats, orderStatusCounts, periodStart, productFormValues, type OrderPeriod } from "@/lib/admin/queries";
import { topProducts } from "@/lib/admin/dashboard";
import { listCustomers } from "@/lib/admin/customers";
import { listPromoCodes } from "@/lib/admin/promocodes";
import { keywordDashboard } from "@/lib/keywords/store";
import { slugify } from "@/lib/admin/slugify";
import { SLUG_RE, toTashkentInput } from "@/lib/admin/product-form";
import { redactPhone } from "@/lib/privacy";
import { normalizePromoCode } from "@/lib/promo/rules";
import { savePromoCode, togglePromoCode } from "@/app/admin/_actions/promocodes";
import { saveProduct } from "@/app/admin/_actions/catalog";
import { setOrderStatus } from "@/app/admin/_actions/orders";
import { t } from "@/lib/admin/i18n/server";

/*
  What the admin assistant can do. Every tool names the permission it needs —
  the same table as the panel's pages and actions (lib/admin/roles.ts) — and
  a role only ever sees the tools it may use.

  Read tools run as soon as the model asks. Write tools never do: the agent
  stops, the admin sees exactly what will change and approves it, and only
  then does the tool run — through the panel's own server action, so the
  validation, the audit log row and the cache refresh are the ones a person
  clicking the form would get.

  Customer phone numbers are redacted before they leave for the model.
*/

export interface ToolContext {
  admin: AdminUser;
}

interface ToolDef<S extends z.ZodObject> {
  name: string;
  description: string;
  permission: Permission;
  write: boolean;
  schema: S;
  /** Write tools: what the admin approves, as label/value rows — built in the request, so t() answers in the admin's language. */
  preview?: (input: z.infer<S>) => [string, string][];
  run: (input: z.infer<S>, ctx: ToolContext) => Promise<unknown>;
}

const tool = <S extends z.ZodObject>(def: ToolDef<S>) => def as unknown as ToolDef<z.ZodObject>;

const money = (n: number | null | undefined) => (n == null ? "—" : `${n.toLocaleString("ru-RU").replace(/ /g, " ")} soʻm`);
const when = (d: Date | null | undefined) => (d ? toTashkentInput(d).replace("T", " ") : null);
const clip = (s: string | null | undefined, n: number) => (s && s.length > n ? `${s.slice(0, n)}…` : (s ?? ""));

/*
  A server action ends a successful create with redirect(), which Next throws
  as an error carrying "NEXT_REDIRECT;<type>;<url>;<status>;" in its digest.
  Here that is the success value: the URL names what was created.
*/
async function runAction(run: () => Promise<{ error?: string; ok?: string } | void | undefined>): Promise<{ ok?: string; error?: string; redirect?: string }> {
  try {
    return (await run()) ?? {};
  } catch (err) {
    const digest = (err as { digest?: unknown }).digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      const url = digest.split(";")[2] ?? "";
      if (url.includes("denied=1") || url.startsWith("/admin/login")) return { error: "Bu amal uchun ruxsatingiz yoʻq." };
      return { redirect: url };
    }
    throw err;
  }
}

function formOf(fields: Record<string, string | string[] | null | undefined>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v == null) continue;
    for (const one of Array.isArray(v) ? v : [v]) form.append(k, one);
  }
  return form;
}

async function findProductId(ref: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(sql`${products.id} = ${ref} or ${products.slug} = ${ref}`)
    .limit(1);
  return row?.id ?? null;
}

/* "2026-12-31" or "2026-12-31 18:00" (Tashkent) → the datetime-local value the forms read. */
const tashkentTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?$/, "YYYY-MM-DD yoki YYYY-MM-DD HH:mm")
  .transform((v) => (v.length === 10 ? `${v}T00:00` : v.replace(" ", "T")));

const PERIOD: Record<number, OrderPeriod> = { 1: "today", 7: "7", 30: "30", 90: "90" };

export const TOOLS = [
  /* ─── Read ─────────────────────────────────────────────────────────── */
  tool({
    name: "search_products",
    description: "Katalogdan mahsulot qidirish (nomi uz/ru yoki slug boʻyicha). Boʻsh query — hamma mahsulot. Narx, eski narx, ombordagi soni, kategoriya.",
    permission: "catalog",
    write: false,
    schema: z.object({ query: z.string().max(100).default(""), limit: z.number().int().min(1).max(50).default(20) }),
    run: async ({ query, limit }) => {
      const rows = await listProducts(query || undefined);
      return {
        total: rows.length,
        products: rows.slice(0, limit).map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.categorySlug,
          brand: p.brandSlug,
          price: p.price,
          oldPrice: p.oldPrice,
          inStock: p.inStock,
          stockQty: p.stockQty,
          hidden: p.kind === "unlisted",
          adminUrl: `/admin/products/${encodeURIComponent(p.id)}`,
        })),
      };
    },
  }),
  tool({
    name: "get_product",
    description: "Bitta mahsulotning toʻliq maʼlumoti (id yoki slug boʻyicha): narx, ombor, rasmlar, matnlar uz/ru, tarkib.",
    permission: "catalog",
    write: false,
    schema: z.object({ product: z.string().min(1).max(120) }),
    run: async ({ product }) => {
      const id = await findProductId(product);
      const v = id ? await productFormValues(id) : null;
      if (!v) return { error: "Mahsulot topilmadi." };
      const c = (k: string) => clip(v.content[k], 600);
      return {
        id: v.id,
        slug: v.slug,
        category: v.categorySlug,
        brand: v.brandSlug,
        price: Number(v.price),
        oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
        inStock: v.inStock,
        stockQty: v.stockQty === "" ? null : Number(v.stockQty),
        kind: v.kind,
        images: v.images.split("\n").filter(Boolean),
        uz: { name: c("uz.name"), tagline: c("uz.tagline"), description: c("uz.description"), ingredients: c("uz.ingredients"), howToUse: c("uz.howToUse") },
        ru: { name: c("ru.name"), tagline: c("ru.tagline"), description: c("ru.description") },
        adminUrl: `/admin/products/${encodeURIComponent(v.id!)}`,
      };
    },
  }),
  tool({
    name: "list_categories_and_brands",
    description: "Kategoriyalar (slug, nomi) va brendlar (slug, nomi) roʻyxati — mahsulot yaratishdan oldin toʻgʻri slugni tanlash uchun.",
    permission: "catalog",
    write: false,
    schema: z.object({}),
    run: async () => {
      const [cats, brandRows] = await Promise.all([listCategories(), listBrands()]);
      return {
        categories: cats.map((c) => ({ slug: c.slug, uz: c.name.uz, ru: c.name.ru })),
        brands: brandRows.map((b) => ({ slug: b.slug, name: b.name })),
      };
    },
  }),
  tool({
    name: "sales_summary",
    description: "Savdo xulosasi: buyurtmalar soni holatlar boʻyicha, tushum (bekor qilinganlarsiz), eng koʻp sotilgan mahsulotlar. days: 1 (bugun), 7, 30 yoki 90.",
    permission: "orders",
    write: false,
    schema: z.object({ days: z.union([z.literal(1), z.literal(7), z.literal(30), z.literal(90)]).default(7) }),
    run: async ({ days }) => {
      const [stats, byStatus, top] = await Promise.all([orderStats(), orderStatusCounts(undefined, periodStart(PERIOD[days])), topProducts(days, 8)]);
      return {
        period: days === 1 ? "bugun" : `oxirgi ${days} kun`,
        ordersByStatus: byStatus.counts,
        revenue: byStatus.revenue,
        openOrdersNow: stats.open,
        ordersToday: stats.today,
        topProducts: top.map((p) => ({ name: p.name, slug: p.slug, units: p.units, revenue: p.revenue })),
      };
    },
  }),
  tool({
    name: "list_orders",
    description: "Buyurtmalar roʻyxati, eng yangisi birinchi. status: new|confirmed|shipped|delivered|cancelled. query — raqam yoki mijoz ismi. Telefonlar yashirilgan.",
    permission: "orders",
    write: false,
    schema: z.object({
      status: z.enum(ORDER_STATUSES).optional(),
      query: z.string().max(100).optional(),
      days: z.union([z.literal(1), z.literal(7), z.literal(30), z.literal(90)]).optional(),
      limit: z.number().int().min(1).max(30).default(15),
    }),
    run: async ({ status, query, days, limit }) => {
      const rows = await listOrders({ status, q: query, from: days ? periodStart(PERIOD[days]) : undefined, limit });
      return rows.map((o) => ({
        number: o.number,
        status: o.status,
        payment: o.paymentStatus,
        total: o.total,
        createdAt: when(o.createdAt),
        customer: o.customer.name,
        phone: redactPhone(o.customer.phone),
        items: o.items.map((i) => `${i.name} × ${i.quantity}`).join(", "),
        promoCode: o.promoCode,
        source: o.source,
      }));
    },
  }),
  tool({
    name: "get_order",
    description: "Bitta buyurtma tafsiloti raqami boʻyicha: mahsulotlar, summalar, yetkazish usuli va shahri, holat, admin izohi.",
    permission: "orders",
    write: false,
    schema: z.object({ number: z.string().min(1).max(20) }),
    run: async ({ number }) => {
      const o = await getOrder(number);
      if (!o) return { error: "Buyurtma topilmadi." };
      return {
        number: o.number,
        status: o.status,
        payment: { method: o.payment?.method ?? null, status: o.paymentStatus },
        createdAt: when(o.createdAt),
        customer: { name: o.customer.name, phone: redactPhone(o.customer.phone) },
        delivery: { method: o.delivery.method, city: (o.delivery as { city?: string }).city ?? null },
        items: o.items.map((i) => ({ name: i.name, slug: i.slug, quantity: i.quantity, unitPrice: i.unitPrice })),
        totals: o.totals,
        promoCode: o.promoCode,
        adminNote: o.adminNote,
        adminUrl: `/admin/orders/${encodeURIComponent(o.number ?? "")}`,
      };
    },
  }),
  tool({
    name: "find_customers",
    description: "Mijozlarni ism yoki telefon boʻyicha topish: buyurtmalar soni, umumiy xarid summasi, oxirgi buyurtma. Telefonlar yashirilgan.",
    permission: "customers",
    write: false,
    schema: z.object({ query: z.string().min(2).max(60) }),
    run: async ({ query }) =>
      (await listCustomers(query, 10)).map((c) => ({
        name: c.name,
        phone: redactPhone(c.phone),
        orders: c.orderCount,
        successfulOrders: c.successfulOrderCount,
        lifetimeValue: c.lifetimeValue,
        lastOrderAt: when(c.lastOrderAt),
        lastStatus: c.lastStatus,
      })),
  }),
  tool({
    name: "list_promocodes",
    description: "Promokodlar: turi, qiymati, ishlatilgan soni, muddati, faolligi, olib kelgan buyurtma va tushum. filter: all|active|expired|personal.",
    permission: "marketing",
    write: false,
    schema: z.object({ filter: z.enum(["all", "active", "expired", "personal"]).default("active"), query: z.string().max(40).optional(), limit: z.number().int().min(1).max(50).default(20) }),
    run: async ({ filter, query, limit }) =>
      (await listPromoCodes({ filter, q: query, limit })).map((p) => ({
        code: p.code,
        discount: p.kind === "percent" ? `${p.value}%` : money(p.value),
        minSubtotal: p.minSubtotal,
        uses: p.uses,
        maxUses: p.maxUses,
        personal: Boolean(p.phone9),
        startsAt: when(p.startsAt),
        endsAt: when(p.endsAt),
        active: p.active,
        source: p.source,
        orders: p.orders,
        revenue: p.revenue,
      })),
  }),
  tool({
    name: "market_demand",
    description: "Google qidiruvidagi talab (Oʻzbekiston, oylik qidiruv) mavzular boʻyicha: qaysi vitamin/BAD qancha qidiriladi, bizda bormi, sahifa bormi. gaps_only — talab bor, bizda yoʻq.",
    permission: "analytics",
    write: false,
    schema: z.object({ gaps_only: z.boolean().default(false), limit: z.number().int().min(1).max(60).default(25) }),
    run: async ({ gaps_only, limit }) => {
      const data = await keywordDashboard();
      return data.subjects
        .filter((s) => s.total > 0 && (!gaps_only || s.gap === "assortment"))
        .slice(0, limit)
        .map((s) => ({
          subject: s.label,
          kind: s.kind,
          monthlySearches: s.total,
          ru: s.byLang.ru,
          uz: s.byLang.uz + s.byLang["uz-cyrl"],
          peakMonth: s.peak,
          topKeywords: s.top.slice(0, 3).map((k) => k.keyword),
          weSell: s.products.map((p) => p.name),
          gap: s.gap,
        }));
    },
  }),

  /* ─── Write (the admin approves each call) ─────────────────────────── */
  tool({
    name: "create_promocode",
    description:
      "Yangi promokod ochish. code boʻsh boʻlsa avtomatik yaratiladi. kind: percent (1–90) yoki fixed (soʻm). Sanalar Toshkent vaqtida «YYYY-MM-DD» yoki «YYYY-MM-DD HH:mm». product_slugs — faqat shu mahsulotlarga. Admin tasdiqlagandan keyin bajariladi.",
    permission: "marketing",
    write: true,
    schema: z.object({
      code: z.string().max(32).default(""),
      kind: z.enum(["percent", "fixed"]),
      value: z.number().int().positive(),
      min_subtotal: z.number().int().min(0).optional(),
      max_uses: z.number().int().min(1).optional(),
      per_phone_limit: z.number().int().min(1).max(100).default(1),
      starts_at: tashkentTime.optional(),
      ends_at: tashkentTime.optional(),
      product_slugs: z.array(z.string().regex(SLUG_RE)).max(100).optional(),
      note: z.string().max(300).default(""),
    }),
    preview: (i) => [
      [t("Kod"), i.code || t("avtomatik")],
      [t("Chegirma"), i.kind === "percent" ? `${i.value}%` : money(i.value)],
      [t("Minimal summa"), money(i.min_subtotal)],
      [t("Umumiy limit"), i.max_uses ? String(i.max_uses) : "—"],
      [t("Bir telefon uchun"), String(i.per_phone_limit)],
      [t("Boshlanishi"), i.starts_at?.replace("T", " ") ?? t("darhol")],
      [t("Tugashi"), i.ends_at?.replace("T", " ") ?? t("muddatsiz")],
      [t("Mahsulotlar"), i.product_slugs?.join(", ") || t("hammasi")],
    ],
    run: async (i) => {
      const r = await runAction(() =>
        savePromoCode(
          undefined,
          formOf({
            code: i.code,
            kind: i.kind,
            value: String(i.value),
            minSubtotal: i.min_subtotal != null ? String(i.min_subtotal) : "",
            maxUses: i.max_uses != null ? String(i.max_uses) : "",
            perPhoneLimit: String(i.per_phone_limit),
            startsAt: i.starts_at ?? "",
            endsAt: i.ends_at ?? "",
            productSlugs: i.product_slugs ?? [],
            note: i.note || "AI yordamchi",
            active: "on",
          }),
        ),
      );
      if (r.error) return { error: r.error };
      const code = r.redirect ? new URL(r.redirect, "http://x").searchParams.get("saved") : null;
      return { ok: true, code, adminUrl: code ? `/admin/promocodes/${encodeURIComponent(code)}` : "/admin/promocodes" };
    },
  }),
  tool({
    name: "set_promocode_active",
    description: "Promokodni yoqish yoki oʻchirish (active: true/false). Admin tasdiqlagandan keyin bajariladi.",
    permission: "marketing",
    write: true,
    schema: z.object({ code: z.string().min(1).max(32), active: z.boolean() }),
    preview: (i) => [[t("Kod"), i.code], [t("Holat"), i.active ? t("yoqiladi") : t("oʻchiriladi")]],
    run: async ({ code: raw, active }) => {
      const code = normalizePromoCode(raw) ?? raw;
      const [row] = await getDb().select({ active: promoCodes.active }).from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      if (!row) return { error: "Promokod topilmadi." };
      if (row.active !== active) {
        const r = await runAction(() => togglePromoCode(formOf({ code })));
        if (r.error) return { error: r.error };
      }
      return { ok: true, code, active };
    },
  }),
  tool({
    name: "create_product",
    description:
      "Yangi mahsulot yaratish. category_slug va brand_slug — list_categories_and_brands dan. images — admin chatga yuklagan rasmlarning URL manzillari (xabardagi «Rasm URL» qatoridan). Matnlar uz va ru. ingredients: har qatorda «Nomi | miqdori | kunlik %». Tibbiy vaʼda yozma («davolaydi» va h.k.). Admin tasdiqlagandan keyin bajariladi.",
    permission: "catalog",
    write: true,
    schema: z.object({
      name_uz: z.string().min(2).max(200),
      name_ru: z.string().min(2).max(200),
      slug: z.string().regex(SLUG_RE).max(80).optional(),
      category_slug: z.string().min(1).max(80),
      brand_slug: z.string().max(80).optional(),
      price: z.number().int().positive(),
      old_price: z.number().int().positive().optional(),
      stock_qty: z.number().int().min(0).max(1_000_000).optional(),
      in_stock: z.boolean().default(true),
      hidden: z.boolean().default(false),
      images: z.array(z.string().url()).max(8).default([]),
      tagline_uz: z.string().max(200).default(""),
      tagline_ru: z.string().max(200).default(""),
      description_uz: z.string().max(4000).default(""),
      description_ru: z.string().max(4000).default(""),
      ingredients_uz: z.string().max(3000).default(""),
      ingredients_ru: z.string().max(3000).default(""),
      how_to_use_uz: z.string().max(1000).default(""),
      how_to_use_ru: z.string().max(1000).default(""),
    }),
    preview: (i) => [
      [t("Nomi (uz)"), i.name_uz],
      [t("Nomi (ru)"), i.name_ru],
      [t("Slug"), i.slug || slugify(i.name_uz)],
      [t("Kategoriya"), i.category_slug],
      [t("Brend"), i.brand_slug || "—"],
      [t("Narxi"), money(i.price)],
      [t("Eski narx"), money(i.old_price)],
      [t("Omborda"), i.stock_qty != null ? t("{n} dona", { n: i.stock_qty }) : i.in_stock ? t("bor") : t("yoʻq")],
      [t("Rasmlar"), String(i.images.length)],
      [t("Saytda"), i.hidden ? t("yashirin") : t("koʻrinadi")],
    ],
    run: async (i) => {
      const r = await runAction(() =>
        saveProduct(
          undefined,
          formOf({
            slug: i.slug || slugify(i.name_uz),
            categorySlug: i.category_slug,
            brandSlug: i.brand_slug ?? "",
            price: String(i.price),
            oldPrice: i.old_price ? String(i.old_price) : "",
            inStock: i.in_stock ? "on" : null,
            stockQty: i.stock_qty != null ? String(i.stock_qty) : "",
            kind: i.hidden ? "unlisted" : "core",
            sort: "0",
            images: i.images.join("\n"),
            "uz.name": i.name_uz,
            "ru.name": i.name_ru,
            "uz.tagline": i.tagline_uz,
            "ru.tagline": i.tagline_ru,
            "uz.description": i.description_uz,
            "ru.description": i.description_ru,
            "uz.ingredients": i.ingredients_uz,
            "ru.ingredients": i.ingredients_ru,
            "uz.howToUse": i.how_to_use_uz,
            "ru.howToUse": i.how_to_use_ru,
          }),
        ),
      );
      if (r.error) return { error: r.error };
      const adminUrl = r.redirect?.split("?")[0] ?? "/admin/products";
      return { ok: true, adminUrl, note: "Saytda darhol koʻrinadi. Matn va rasmni mahsulot sahifasida tekshirish tavsiya etiladi." };
    },
  }),
  tool({
    name: "update_product",
    description:
      "Mavjud mahsulotning narxi, eski narxi (chegirma uchun; 0 — olib tashlash), ombordagi soni yoki sotuvda bor/yoʻqligini oʻzgartirish. Faqat berilgan maydonlar oʻzgaradi. Admin tasdiqlagandan keyin bajariladi.",
    permission: "catalog",
    write: true,
    schema: z.object({
      product: z.string().min(1).max(120),
      price: z.number().int().positive().optional(),
      old_price: z.number().int().min(0).optional(),
      stock_qty: z.number().int().min(0).max(1_000_000).optional(),
      in_stock: z.boolean().optional(),
    }),
    preview: (i) => [
      [t("Mahsulot"), i.product],
      ...(i.price != null ? [[t("Yangi narx"), money(i.price)] as [string, string]] : []),
      ...(i.old_price != null ? [[t("Eski narx"), i.old_price === 0 ? t("olib tashlanadi") : money(i.old_price)] as [string, string]] : []),
      ...(i.stock_qty != null ? [[t("Omborda"), t("{n} dona", { n: i.stock_qty })] as [string, string]] : []),
      ...(i.in_stock != null ? [[t("Sotuvda"), i.in_stock ? t("bor") : t("yoʻq")] as [string, string]] : []),
    ],
    run: async (i) => {
      const id = await findProductId(i.product);
      const v = id ? await productFormValues(id) : null;
      if (!v) return { error: "Mahsulot topilmadi." };
      const r = await runAction(() =>
        saveProduct(
          undefined,
          formOf({
            id: v.id,
            stockQtyBefore: v.stockQty,
            slug: v.slug,
            categorySlug: v.categorySlug,
            brandSlug: v.brandSlug,
            price: i.price != null ? String(i.price) : v.price,
            oldPrice: i.old_price != null ? (i.old_price === 0 ? "" : String(i.old_price)) : v.oldPrice,
            saleEndsAt: v.saleEndsAt,
            inStock: (i.in_stock ?? v.inStock) ? "on" : null,
            stockQty: i.stock_qty != null ? String(i.stock_qty) : v.stockQty,
            lowStockAt: v.lowStockAt,
            mxikCode: v.mxikCode,
            packageCode: v.packageCode,
            registrationNumber: v.registrationNumber,
            kind: v.kind,
            sort: v.sort,
            images: v.images,
            cutout: v.cutout,
            unitCount: v.unitCount,
            unitKind: v.unitKind,
            ...v.content,
          }),
        ),
      );
      if (r.error) return { error: r.error };
      return { ok: true, message: r.ok, adminUrl: `/admin/products/${encodeURIComponent(v.id!)}` };
    },
  }),
  tool({
    name: "set_order_status",
    description: "Buyurtma holatini oʻzgartirish: new|confirmed|shipped|delivered|cancelled. Mijozga xabar ketadi, ombor va ballar qayta hisoblanadi. Admin tasdiqlagandan keyin bajariladi.",
    permission: "orders",
    write: true,
    schema: z.object({ number: z.string().min(1).max(20), status: z.enum(ORDER_STATUSES) }),
    preview: (i) => [[t("Buyurtma"), i.number], [t("Yangi holat"), i.status]],
    run: async ({ number, status }) => {
      const before = await getOrder(number);
      if (!before) return { error: "Buyurtma topilmadi." };
      if (before.status === status) return { ok: true, note: "Holat allaqachon shunday edi." };
      const r = await runAction(() => setOrderStatus(formOf({ number, status })));
      if (r.error) return { error: r.error };
      const after = await getOrder(number);
      return after?.status === status ? { ok: true, from: before.status, to: status } : { error: "Holat oʻzgarmadi." };
    },
  }),
];

export type AssistantTool = (typeof TOOLS)[number];

export const toolByName = (name: string) => TOOLS.find((t) => t.name === name);

/** Keep the call that the schema accepts unchanged; report the first problem otherwise. */
export function parseToolInput(t: AssistantTool, input: unknown): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const parsed = t.schema.safeParse(input ?? {});
  if (parsed.success) return { ok: true, data: parsed.data as Record<string, unknown> };
  const issue = parsed.error.issues[0];
  return { ok: false, error: `${issue?.path.join(".") || "input"}: ${issue?.message ?? "notoʻgʻri"}` };
}

