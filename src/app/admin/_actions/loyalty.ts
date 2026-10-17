"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import { RULE_LIMITS, coerceLoyaltyRules, type LoyaltyRules } from "@/lib/loyalty/model";
import { readLoyaltyRules, saveLoyaltyRules } from "@/lib/loyalty/settings";
import { adjustPoints } from "@/lib/loyalty/server";
import type { FormState } from "./catalog";

const L = RULE_LIMITS;
const n = (label: string, [min, max]: readonly [number, number]) =>
  z.coerce.number({ invalid_type_error: `${label}: son kiriting` }).int(`${label}: butun son`).min(min, `${label}: ${min}–${max}`).max(max, `${label}: ${min}–${max}`);

const cashbackSchema = z.object({
  earnPercent: n("Keshbek foizi", L.earnPercent),
  minOrder: n("Minimal buyurtma", L.minOrder),
  maxSharePercent: n("Ball bilan toʻlash ulushi", L.maxSharePercent),
  expiryDays: n("Amal qilish muddati", L.expiryDays),
});

const referralSchema = z.object({
  friendPercent: n("Doʻst chegirmasi", L.friendPercent),
  reward: z.enum(["points", "promo"]),
  rewardPoints: n("Mukofot ball", L.rewardPoints),
  rewardPercent: n("Mukofot promokod foizi", L.rewardPercent),
  monthlyCap: n("Oylik limit", L.monthlyCap),
});

const birthdaySchema = z.object({ daysBefore: n("Necha kun oldin", L.daysBefore) });

async function persist(next: LoyaltyRules, adminId: number): Promise<void> {
  await saveLoyaltyRules(coerceLoyaltyRules(next), adminId);
  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/loyalty");
}

/** One form per section; the other sections keep what they had. */
export async function saveCashbackRules(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = cashbackSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const current = await readLoyaltyRules();
  await persist({ ...current, ...parsed.data, enabled: form.get("enabled") === "on" }, admin.id);
  return { ok: "Saqlandi. Savat, buyurtma va /loyalty sahifasi yangi qoidalar bilan ishlaydi." };
}

export async function saveReferralRules(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = referralSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const current = await readLoyaltyRules();
  await persist({ ...current, referral: { ...parsed.data, enabled: form.get("enabled") === "on" } }, admin.id);
  return { ok: "Saqlandi." };
}

export async function saveBirthdayRules(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = birthdaySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const current = await readLoyaltyRules();
  await persist({ ...current, birthday: { daysBefore: parsed.data.daysBefore, enabled: form.get("enabled") === "on" } }, admin.id);
  return { ok: "Saqlandi. Xabar yuborish — «Avtomatlashtirish» boʻlimidagi «Tugʻilgan kun» oqimi yoqilganda." };
}

const adjustSchema = z.object({
  phone9: z.string().regex(/^[0-9]{9}$/),
  delta: z.coerce
    .number({ invalid_type_error: "Ball miqdorini kiriting" })
    .int("Butun son kiriting")
    .refine((v) => v !== 0, "Nol boʻlmasin")
    .refine((v) => Math.abs(v) <= 10_000_000, "Juda katta miqdor"),
  note: z.string().trim().min(3, "Izoh yozing (kamida 3 belgi)").max(300),
});

/** Manual correction on the customer page. The note is required: every change to a balance has a reason on record. */
export async function adjustCustomerPoints(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = adjustSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const balance = await adjustPoints({ ...parsed.data, adminId: admin.id });
  revalidatePath(`/admin/customers/${parsed.data.phone9}`);
  return { ok: `Saqlandi. Yangi balans: ${balance.toLocaleString("ru-RU").replace(/ /g, " ")} ball.` };
}
