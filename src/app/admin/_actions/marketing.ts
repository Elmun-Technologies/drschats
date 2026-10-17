"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { botMembers, campaigns, promotions } from "@/lib/db/schema";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { rawPromotions } from "@/lib/shopflow/mock";
import { SLUG_RE, fromTashkentInput } from "@/lib/admin/product-form";
import { requireAdmin } from "@/lib/admin/session";
import { segmentById, segmentMembers } from "@/lib/admin/segments";
import { enqueue } from "@/lib/bot/store";
import { escapeHtml } from "@/lib/bot/messages";
import type { FormState } from "./catalog";

const campaignSchema = z.object({
  segment: z.string().min(1).max(40),
  name: z.string().trim().min(2, "Kampaniya nomini yozing.").max(120),
  message: z.string().trim().min(5, "Xabar matnini yozing.").max(1000, "Xabar 1000 belgidan oshmasin."),
  confirm: z.literal("on", { errorMap: () => ({ message: "Yuborishni tasdiqlang." }) }),
});

/*
  A Telegram message to the members of a segment who linked the club bot and
  have not blocked it. Linking the bot (and pressing /start) is their consent
  to hear from the shop; nobody else is messaged. {ism} becomes the
  customer's first name.
*/
export async function sendSegmentCampaign(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = campaignSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const segment = segmentById(parsed.data.segment);
  if (!segment) return { error: "Segment topilmadi." };

  const members = await segmentMembers(segment, 5000);
  const chatIds = [...new Set(members.map((m) => m.telegramChatId).filter((id): id is number => id !== null))];
  const db = getDb();
  const active = chatIds.length
    ? new Set((await db.select({ chatId: botMembers.chatId }).from(botMembers).where(and(inArray(botMembers.chatId, chatIds), isNull(botMembers.blockedAt)))).map((r) => r.chatId))
    : new Set<number>();
  const recipients = members.filter((m) => m.telegramChatId !== null && active.has(m.telegramChatId));
  if (recipients.length === 0) {
    return { error: "Bu segmentda Telegram botga ulangan mijoz yoʻq. Mijozlar botda telefonini ulashganda ular shu yerda paydo boʻladi." };
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({ name: parsed.data.name, channel: "telegram", segment: segment.id, message: parsed.data.message, audience: members.length, createdBy: admin.id })
    .returning({ id: campaigns.id });
  const seen = new Set<number>();
  for (const member of recipients) {
    const chatId = member.telegramChatId!;
    if (seen.has(chatId)) continue;
    seen.add(chatId);
    const firstName = member.name?.trim().split(/\s+/)[0] ?? "";
    const text = escapeHtml(parsed.data.message.replaceAll("{ism}", firstName || "doʻstim"));
    await enqueue(chatId, { text }, { kind: "campaign", dedupeKey: `campaign:${campaign.id}:${chatId}` });
  }
  await db.update(campaigns).set({ status: "sent", queued: seen.size, sentAt: new Date() }).where(eq(campaigns.id, campaign.id));
  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/segments/${segment.id}`);
  return { ok: `${seen.size} ta mijozga navbatga qoʻyildi. Bot daqiqasiga ~60 ta xabar yuboradi.` };
}

/* ─── Promotions ─────────────────────────────────────────────────────────── */

const promotionSchema = z
  .object({
    type: z.enum(["percent_off", "buy_x_get_y", "free_shipping_over"]),
    "uz.title": z.string().trim().min(2, "Sarlavha (uz) majburiy").max(80),
    "ru.title": z.string().trim().min(2, "Sarlavha (ru) majburiy").max(80),
    "uz.description": z.string().trim().max(240).default(""),
    "ru.description": z.string().trim().max(240).default(""),
    percent: z.string().trim().default(""),
    threshold: z.string().trim().default(""),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    sort: z.coerce.number().int().min(-999).max(999).default(0),
  })
  .superRefine((d, ctx) => {
    if (d.type === "percent_off") {
      const n = Number(d.percent);
      if (!Number.isInteger(n) || n < 1 || n > 90) ctx.addIssue({ code: "custom", message: "Chegirma foizi 1 dan 90 gacha boʻlsin.", path: ["percent"] });
    }
    if (d.type === "free_shipping_over") {
      const n = Number(d.threshold);
      if (!Number.isInteger(n) || n < 0) ctx.addIssue({ code: "custom", message: "Bepul yetkazish chegarasini soʻmda kiriting.", path: ["threshold"] });
    }
  });

function refreshCatalog() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

export async function savePromotion(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const parsed = promotionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const d = parsed.data;
  const slugs = form.getAll("productSlugs").map(String).filter((s) => SLUG_RE.test(s)).slice(0, 500);
  const startsAt = fromTashkentInput(d.startsAt);
  const endsAt = fromTashkentInput(d.endsAt);
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "Tugash sanasi boshlanishdan keyin boʻlsin." };
  const row = {
    type: d.type,
    title: { uz: d["uz.title"], ru: d["ru.title"] },
    description: { uz: d["uz.description"], ru: d["ru.description"] },
    percent: d.type === "percent_off" ? Number(d.percent) : null,
    threshold: d.type === "free_shipping_over" ? Number(d.threshold) : null,
    productSlugs: d.type === "free_shipping_over" || slugs.length === 0 ? null : slugs,
    active: form.get("active") === "on",
    startsAt,
    endsAt,
    sort: d.sort,
    updatedAt: new Date(),
  };
  const db = getDb();
  const id = data.id?.trim();
  if (id) {
    const updated = await db.update(promotions).set(row).where(eq(promotions.id, id)).returning({ id: promotions.id });
    if (updated.length === 0) return { error: "Aksiya topilmadi." };
  } else {
    await db.insert(promotions).values({ id: `promo-${randomBytes(4).toString("hex")}`, ...row });
  }
  refreshCatalog();
  revalidatePath("/admin/promotions");
  if (!id) redirect("/admin/promotions?saved=1");
  return { ok: "Saqlandi. Saytda darhol amal qiladi." };
}

export async function togglePromotion(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (id) await getDb().update(promotions).set({ active: sql`not ${promotions.active}`, updatedAt: new Date() }).where(eq(promotions.id, id));
  refreshCatalog();
  revalidatePath("/admin/promotions");
}

export async function deletePromotion(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (id) await getDb().delete(promotions).where(eq(promotions.id, id));
  refreshCatalog();
  redirect("/admin/promotions?deleted=1");
}

/* Copies the promotions the site runs today into the table, so the team can edit or switch them off. */
export async function importBuiltInPromotions(_: FormState, _form: FormData): Promise<FormState> {
  await requireAdmin();
  const rows = await getDb()
    .insert(promotions)
    .values(
      rawPromotions.map((p, i) => ({
        id: p.id,
        type: p.type,
        title: p.title,
        description: p.description,
        percent: p.percent ?? null,
        threshold: p.threshold ?? null,
        productSlugs: p.productSlugs ?? null,
        active: true,
        sort: i,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: promotions.id });
  refreshCatalog();
  redirect(`/admin/promotions?imported=${rows.length}`);
}
