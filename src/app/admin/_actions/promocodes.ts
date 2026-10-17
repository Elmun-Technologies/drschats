"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { promoCodes, promoRedemptions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { SLUG_RE, fromTashkentInput } from "@/lib/admin/product-form";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import { normalizePromoCode, phone9Of } from "@/lib/promo/rules";
import { issuePromoCode, issuePromoCodeBatch } from "@/lib/promo/server";
import { saveFirstOrderSetting } from "@/lib/promo/settings";
import type { FormState } from "./catalog";

const optionalInt = (label: string, min: number) =>
  z
    .string()
    .trim()
    .default("")
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= min), `${label}: ${min} yoki undan katta butun son kiriting.`)
    .transform((v) => (v === "" ? null : Number(v)));

const codeSchema = z
  .object({
    code: z.string().trim().default(""),
    kind: z.enum(["percent", "fixed"]),
    value: z.string().trim().transform((v) => Number(v.replace(/\s/g, ""))),
    minSubtotal: optionalInt("Minimal summa", 0),
    maxUses: optionalInt("Umumiy limit", 1),
    perPhoneLimit: z.string().trim().default("1").transform((v) => Number(v || "1")),
    phone: z.string().trim().default(""),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    note: z.string().trim().max(300).default(""),
  })
  .superRefine((d, ctx) => {
    if (!Number.isInteger(d.value) || d.value <= 0) ctx.addIssue({ code: "custom", message: "Chegirma qiymatini kiriting.", path: ["value"] });
    else if (d.kind === "percent" && d.value > 90) ctx.addIssue({ code: "custom", message: "Foiz 1 dan 90 gacha boʻlsin.", path: ["value"] });
    if (!Number.isInteger(d.perPhoneLimit) || d.perPhoneLimit < 1 || d.perPhoneLimit > 100) {
      ctx.addIssue({ code: "custom", message: "Bir telefon uchun limit 1–100.", path: ["perPhoneLimit"] });
    }
    if (d.phone && !phone9Of(d.phone)) ctx.addIssue({ code: "custom", message: "Telefon raqami kamida 9 raqamdan iborat boʻlsin.", path: ["phone"] });
  });

function refresh(code?: string) {
  revalidatePath("/admin/promocodes");
  if (code) revalidatePath(`/admin/promocodes/${encodeURIComponent(code)}`);
}

/** Create (code typed or generated) or edit a code. The code itself is fixed once created. */
export async function savePromoCode(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const parsed = codeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const d = parsed.data;
  const startsAt = fromTashkentInput(d.startsAt);
  const endsAt = fromTashkentInput(d.endsAt);
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "Tugash sanasi boshlanishdan keyin boʻlsin." };
  const slugs = form.getAll("productSlugs").map(String).filter((s) => SLUG_RE.test(s)).slice(0, 500);
  const row = {
    kind: d.kind,
    value: d.value,
    minSubtotal: d.minSubtotal,
    maxUses: d.maxUses,
    perPhoneLimit: d.perPhoneLimit,
    phone9: d.phone ? phone9Of(d.phone) : null,
    productSlugs: slugs.length > 0 ? slugs : null,
    startsAt,
    endsAt,
    active: form.get("active") === "on",
    note: d.note || null,
  };
  const db = getDb();
  const editing = data.original?.trim();
  if (editing) {
    const updated = await db.update(promoCodes).set(row).where(eq(promoCodes.code, editing)).returning({ code: promoCodes.code });
    if (updated.length === 0) return { error: "Promokod topilmadi." };
    refresh(editing);
    return { ok: "Saqlandi. Savatda darhol amal qiladi." };
  }

  let code: string;
  if (d.code) {
    const normalized = normalizePromoCode(d.code);
    if (!normalized) return { error: "Kod 3–32 belgi: lotin harflari, raqamlar va chiziqcha (-)." };
    const inserted = await db.insert(promoCodes).values({ code: normalized, ...row, source: "manual" }).onConflictDoNothing().returning({ code: promoCodes.code });
    if (inserted.length === 0) return { error: `${normalized} kodi allaqachon bor.` };
    code = normalized;
  } else {
    code = await issuePromoCode({
      kind: row.kind,
      value: row.value,
      phone: d.phone || null,
      source: "manual",
      minSubtotal: row.minSubtotal,
      maxUses: row.maxUses,
      productSlugs: row.productSlugs,
      note: row.note,
    });
    await db.update(promoCodes).set({ perPhoneLimit: row.perPhoneLimit, startsAt, endsAt, active: row.active }).where(eq(promoCodes.code, code));
  }
  refresh();
  redirect(`/admin/promocodes?saved=${encodeURIComponent(code)}`);
}

export async function togglePromoCode(form: FormData) {
  await requireAdmin();
  const code = String(form.get("code") ?? "");
  if (code) await getDb().update(promoCodes).set({ active: sql`not ${promoCodes.active}` }).where(eq(promoCodes.code, code));
  refresh(code);
}

/** Only an unused code can be deleted; a used one is part of order history — deactivate it instead. */
export async function deletePromoCode(form: FormData) {
  await requireAdmin();
  const code = String(form.get("code") ?? "");
  if (!code) return;
  const db = getDb();
  const [used] = await db.select({ n: sql<number>`count(*)::int` }).from(promoRedemptions).where(eq(promoRedemptions.code, code));
  if ((used?.n ?? 0) > 0) redirect(`/admin/promocodes/${encodeURIComponent(code)}?inUse=1`);
  await db.delete(promoCodes).where(eq(promoCodes.code, code));
  refresh();
  redirect("/admin/promocodes?deleted=1");
}

const batchSchema = z
  .object({
    count: z.coerce.number().int().min(1, "Kamida 1 ta kod.").max(2000, "Bir martada 2000 tagacha."),
    kind: z.enum(["percent", "fixed"]),
    value: z.coerce.number().int().positive("Chegirma qiymatini kiriting."),
    ttlDays: z.coerce.number().int().min(0).max(365).default(0),
    minSubtotal: optionalInt("Minimal summa", 0),
    label: z.string().trim().max(60).default(""),
  })
  .refine((d) => d.kind !== "percent" || d.value <= 90, { message: "Foiz 1 dan 90 gacha boʻlsin.", path: ["value"] });

/** N personal single-use codes under one campaign id, then the CSV link. */
export async function generatePromoBatch(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = batchSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const d = parsed.data;
  const slug = d.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const campaignId = `${slug || "batch"}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(2).toString("hex")}`;
  const codes = await issuePromoCodeBatch(d.count, {
    kind: d.kind,
    value: d.value,
    ttlHours: d.ttlDays * 24,
    minSubtotal: d.minSubtotal,
    source: "campaign",
    campaignId,
    note: d.label || null,
  });
  refresh();
  redirect(`/admin/promocodes?batch=${encodeURIComponent(campaignId)}&made=${codes.length}`);
}

const firstOrderSchema = z.object({
  percent: z.coerce.number().int().min(1, "Foiz 1 dan 50 gacha.").max(50, "Foiz 1 dan 50 gacha."),
});

export async function saveFirstOrderDiscount(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = firstOrderSchema.safeParse({ percent: form.get("percent") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Foizni tekshiring." };
  await saveFirstOrderSetting({ enabled: form.get("enabled") === "on", percent: parsed.data.percent }, admin.id);
  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/promocodes");
  return { ok: "Saqlandi. Saytda va savatda darhol amal qiladi." };
}
