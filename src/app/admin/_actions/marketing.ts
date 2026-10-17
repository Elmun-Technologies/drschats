"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { campaigns, promotions, type MessagePromo } from "@/lib/db/schema";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { rawPromotions } from "@/lib/shopflow/mock";
import { SLUG_RE, fromTashkentInput } from "@/lib/admin/product-form";
import { requireAdmin } from "@/lib/admin/session";
import { segmentById, segmentMembers } from "@/lib/admin/segments";
import { queueMessage, reachContext, resolveReach, type Reach } from "@/lib/messaging/outbox";
import { firstName, renderTemplate } from "@/lib/messaging/template";
import { isQuietHours } from "@/lib/messaging/quiet-hours";
import { campaignMessageKey } from "@/lib/messaging/keys";
import type { FormState } from "./catalog";

const campaignSchema = z
  .object({
    segment: z.string().min(1).max(40),
    name: z.string().trim().min(2, "Kampaniya nomini yozing.").max(120),
    message: z.string().trim().min(5, "Xabar matnini yozing.").max(1000, "Xabar 1000 belgidan oshmasin."),
    channel: z.enum(["telegram", "sms", "telegram_then_sms"]).default("telegram"),
    link: z.string().trim().max(200).regex(/^$|^\/[A-Za-z0-9\-_/?=&.%]*$/, "Havola / bilan boshlansin (masalan /sale).").default(""),
    promoKind: z.enum(["none", "percent", "fixed"]).default("none"),
    promoValue: z.coerce.number().int().default(0),
    promoTtl: z.coerce.number().int().default(72),
    promoMin: z.string().trim().default(""),
    confirm: z.literal("on", { errorMap: () => ({ message: "Yuborishni tasdiqlang." }) }),
  })
  .superRefine((d, ctx) => {
    if (d.promoKind !== "none") {
      if (d.promoValue < 1 || (d.promoKind === "percent" && d.promoValue > 90)) ctx.addIssue({ code: "custom", message: "Chegirma: foiz 1–90, summa 1 soʻmdan.", path: ["promoValue"] });
      if (d.promoTtl < 1 || d.promoTtl > 24 * 90) ctx.addIssue({ code: "custom", message: "Kod muddati 1 soatdan 90 kungacha.", path: ["promoTtl"] });
      if (!d.message.includes("{kod}")) ctx.addIssue({ code: "custom", message: "Shaxsiy kod tanlangan — matnga {kod} qoʻshing.", path: ["message"] });
    }
    if (d.link && !d.message.includes("{havola}")) ctx.addIssue({ code: "custom", message: "Havola berilgan — matnga {havola} qoʻshing.", path: ["message"] });
    if (d.message.includes("{havola}") && !d.link) ctx.addIssue({ code: "custom", message: "Matnda {havola} bor — havola sahifasini yozing (masalan /sale).", path: ["link"] });
  });

/*
  A message to the members of a segment, through the same outbox as the
  automations: quiet hours (21:00–09:00 Tashkent → 09:00), opt-out, a STOP
  link on every SMS and an «oʻchirish» button on Telegram, an optional
  personal promo code per recipient (issued when the message leaves) and the
  short click link that ties orders back to the campaign.

  Telegram goes only to members who linked the club bot and have not blocked
  it (pressing /start is their consent); SMS only to customers whose number
  we have from an order. {ism} becomes the customer's first name.
*/
export async function sendSegmentCampaign(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = campaignSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const segment = segmentById(parsed.data.segment);
  if (!segment) return { error: "Segment topilmadi." };
  const d = parsed.data;
  const promo: MessagePromo | null =
    d.promoKind === "none" ? null : { kind: d.promoKind, value: d.promoValue, ttlHours: d.promoTtl, minSubtotal: d.promoMin ? Math.max(0, Math.round(Number(d.promoMin))) || null : null };

  const members = await segmentMembers(segment, 5000);
  const db = getDb();
  const ctx = await reachContext();
  if (d.channel === "sms" && !ctx.smsAvailable) return { error: "SMS ulanmagan. Integratsiyalar → SMS (Eskiz) boʻlimida sozlang." };

  const targets: { phone9: string; name: string | null; reach: Exclude<Reach, { channel: null }> }[] = [];
  const seen = new Set<string>();
  let unreachable = 0;
  for (const member of members) {
    const phone9 = member.phone?.replace(/\D/g, "").slice(-9) ?? "";
    if (phone9.length !== 9 || seen.has(phone9)) continue;
    seen.add(phone9);
    const reach = await resolveReach(db, phone9, d.channel, ctx);
    if (reach.channel === null) unreachable += 1;
    else targets.push({ phone9, name: member.name, reach });
  }
  if (targets.length === 0) {
    return {
      error:
        d.channel === "telegram"
          ? "Bu segmentda Telegram botga ulangan mijoz yoʻq. Mijozlar botda telefonini ulashganda ular shu yerda paydo boʻladi."
          : "Bu segmentda xabar yuborish mumkin boʻlgan mijoz yoʻq (telefon yoʻq yoki obunadan chiqqan).",
    };
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({ name: d.name, channel: d.channel, segment: segment.id, message: d.message, audience: members.length, createdBy: admin.id, promo, link: d.link || null })
    .returning({ id: campaigns.id });
  let queued = 0;
  for (const t of targets) {
    const id = await queueMessage(db, {
      channel: t.reach.channel,
      phone9: t.phone9,
      chatId: t.reach.channel === "telegram" ? t.reach.chatId : null,
      locale: "uz",
      text: renderTemplate(d.message, { ism: firstName(t.name, "uz") }),
      link: d.link || null,
      promo,
      campaignId: campaign.id,
      dedupeKey: campaignMessageKey(campaign.id, t.phone9),
    });
    if (id) queued += 1;
  }
  await db.update(campaigns).set({ status: "sent", queued, sentAt: new Date() }).where(eq(campaigns.id, campaign.id));
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/segments/${segment.id}`);
  const night = isQuietHours(new Date()) ? " Hozir tungi vaqt — xabarlar ertalab 09:00 da ketadi." : "";
  return { ok: `${queued} ta mijozga navbatga qoʻyildi${unreachable ? ` (${unreachable} tasiga kanal yoʻq yoki obunadan chiqqan)` : ""}. Ishchi har daqiqada yuboradi.${night}` };
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
