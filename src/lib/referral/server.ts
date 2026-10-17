import "server-only";

import { randomInt } from "node:crypto";
import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { loyaltyLedger, referralCodes, referrals, type ReferralReward } from "@/lib/db/schema";
import { issuePromoCode, previousOrders } from "@/lib/promo/server";
import { firstOrderDiscount, type PromoLine } from "@/lib/promo/rules";
import { queueMessage, reachContext, resolveReach } from "@/lib/messaging/outbox";
import { lotExpiry, referralRewardKind, type LoyaltyRules } from "@/lib/loyalty/model";
import { phoneLockSql } from "@/lib/loyalty/server";
import type { Promotion } from "@/lib/shopflow/types";
import { evaluateReferral, generateReferralCode, isReferralCode, rewardAllowed, tashkentMonthStart, type ReferralRejection } from "./rules";

/*
  Referral codes against the database. The friend's discount is decided in
  the order transaction (lib/promo/server.ts → placeOrder) with the same
  checks as the cart preview here; the referrer's reward when the order is
  delivered (rewardReferral, called from the admin status change).
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Exec = Db | Tx;

/** The code's owner, or null. */
export async function referralOwner(exec: Exec, code: string): Promise<string | null> {
  if (!isReferralCode(code)) return null;
  const [row] = await exec.select({ phone9: referralCodes.phone9 }).from(referralCodes).where(eq(referralCodes.code, code)).limit(1);
  return row?.phone9 ?? null;
}

async function liveReferral(exec: Exec, phone9: string): Promise<boolean> {
  const [row] = await exec
    .select({ id: referrals.id })
    .from(referrals)
    .where(and(eq(referrals.referredPhone9, phone9), ne(referrals.status, "cancelled")))
    .limit(1);
  return Boolean(row);
}

export type ReferralQuote =
  | { ok: true; code: string; percent: number; discount: number; referrer: string }
  | { ok: false; code: string; reason: ReferralRejection };

export async function quoteReferral(
  exec: Exec,
  input: { code: string; phone9: string | null; lines: PromoLine[]; promotions: Promotion[]; rules: LoyaltyRules },
): Promise<ReferralQuote> {
  const owner = await referralOwner(exec, input.code);
  const check = evaluateReferral({
    enabled: input.rules.referral.enabled,
    ownerPhone9: owner,
    phone9: input.phone9,
    previousOrders: input.phone9 && owner ? await previousOrders(exec, input.phone9) : 0,
    alreadyReferred: input.phone9 && owner ? await liveReferral(exec, input.phone9) : false,
  });
  // Before the phone is typed the cart previews the discount; the order checks the phone.
  if (!check.ok && check.reason !== "needs_phone") return { ok: false, code: input.code, reason: check.reason };
  const percent = input.rules.referral.friendPercent;
  return { ok: true, code: input.code, percent, discount: firstOrderDiscount(input.lines, input.promotions, percent), referrer: owner! };
}

/** Records the referral of a placed order (inside the order transaction). */
export async function recordReferral(tx: Tx, input: { code: string; referrer: string; referred: string; orderId: number; discount: number }): Promise<void> {
  await tx.insert(referrals).values({
    code: input.code,
    referrerPhone9: input.referrer,
    referredPhone9: input.referred,
    orderId: input.orderId,
    discount: input.discount,
  });
}

/**
 * A customer's code, created on first ask once they have a delivered order.
 * Null for a phone without one — the code is a thank-you, not a sign-up perk.
 */
export async function ensureReferralCode(phone9: string): Promise<string | null> {
  const db = getDb();
  const [existing] = await db.select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.phone9, phone9)).limit(1);
  if (existing) return existing.code;
  const [delivered] = (await db.execute(sql`
    select 1 from orders where status = 'delivered'
      and right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) = ${phone9} limit 1`)) as unknown as unknown[];
  if (!delivered) return null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const inserted = await db
      .insert(referralCodes)
      .values({ phone9, code: generateReferralCode(randomInt) })
      .onConflictDoNothing()
      .returning({ code: referralCodes.code });
    if (inserted[0]) return inserted[0].code;
    const [again] = await db.select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.phone9, phone9)).limit(1);
    if (again) return again.code;
  }
  return null;
}

export async function existingReferralCode(phone9: string): Promise<string | null> {
  const [row] = await getDb().select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.phone9, phone9)).limit(1);
  return row?.code ?? null;
}

const groupThousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const REWARD_TEXT = {
  points: {
    uz: "{ism}, doʻstingiz sizning kodingiz bilan birinchi xaridini qildi — hisobingizga {summa} ball qoʻshildi. Rahmat! {havola}",
    ru: "{ism}, ваш друг сделал первую покупку по вашему коду — на счёт начислено {summa} баллов. Спасибо! {havola}",
  },
  promo: {
    uz: "{ism}, doʻstingiz sizning kodingiz bilan birinchi xaridini qildi. Sizga −{foiz}% shaxsiy kod: {kodi}. Rahmat! {havola}",
    ru: "{ism}, ваш друг сделал первую покупку по вашему коду. Ваш персональный код −{foiz}%: {kodi}. Спасибо! {havola}",
  },
};

/**
 * The friend's order was delivered: reward the referrer, once. Over the
 * monthly cap the referral is marked "capped" and nothing is paid. The
 * thank-you goes through the outbox (Telegram, else SMS; quiet hours and
 * opt-outs apply).
 */
export async function rewardReferral(orderId: number, rules: LoyaltyRules, now = new Date()): Promise<ReferralReward | null> {
  if (!rules.referral.enabled) return null;
  const kind = referralRewardKind(rules);
  // A personal code is issued before the transaction (it has its own); an unused one is harmless if the transaction then finds nothing to reward.
  const db = getDb();
  const [pending] = await db.select().from(referrals).where(and(eq(referrals.orderId, orderId), eq(referrals.status, "pending"))).limit(1);
  if (!pending) return null;
  const promoCode =
    kind === "promo"
      ? await issuePromoCode({
          kind: "percent",
          value: rules.referral.rewardPercent,
          phone: pending.referrerPhone9,
          ttlHours: 60 * 24,
          source: "referral",
          campaignId: "referral",
          note: `Tavsiya uchun: ${pending.code}`,
        })
      : null;
  const reach = await reachContext();
  return db.transaction(async (tx) => {
    await tx.execute(phoneLockSql(pending.referrerPhone9));
    const [row] = await tx.select().from(referrals).where(and(eq(referrals.id, pending.id), eq(referrals.status, "pending"))).for("update");
    if (!row) return null;
    const [{ n }] = (await tx.execute(sql`
      select count(*)::int as n from referrals
      where referrer_phone9 = ${row.referrerPhone9} and status = 'rewarded'
        and rewarded_at >= ${tashkentMonthStart(now).toISOString()}::timestamptz`)) as unknown as { n: number }[];
    if (!rewardAllowed(n, rules.referral.monthlyCap)) {
      await tx.update(referrals).set({ status: "capped" }).where(eq(referrals.id, row.id));
      return null;
    }
    let reward: ReferralReward;
    if (kind === "points") {
      await tx.insert(loyaltyLedger).values({
        phone9: row.referrerPhone9,
        delta: rules.referral.rewardPoints,
        kind: "adjust",
        orderId,
        note: `Tavsiya: ${row.code}`,
        expiresAt: lotExpiry(now, rules.expiryDays),
      });
      reward = { kind: "points", amount: rules.referral.rewardPoints };
    } else {
      reward = { kind: "promo", code: promoCode!, percent: rules.referral.rewardPercent };
    }
    await tx.update(referrals).set({ status: "rewarded", reward, rewardedAt: now }).where(eq(referrals.id, row.id));

    const [who] = (await tx.execute(sql`
      select o.customer->>'name' as name, o.locale from orders o
      where right(regexp_replace(o.customer->>'phone', '\\D', '', 'g'), 9) = ${row.referrerPhone9}
      order by o.created_at desc limit 1`)) as unknown as { name: string | null; locale: string | null }[];
    const locale = who?.locale === "ru" ? "ru" : "uz";
    const first = (who?.name ?? "").trim().split(/\s+/)[0] || (locale === "ru" ? "друг" : "doʻstim");
    const template = REWARD_TEXT[reward.kind][locale];
    const text = template
      .replace("{ism}", first)
      .replace("{summa}", reward.kind === "points" ? groupThousands(reward.amount) : "")
      .replace("{foiz}", reward.kind === "promo" ? String(reward.percent) : "")
      .replace("{kodi}", reward.kind === "promo" ? reward.code : "");
    const target = await resolveReach(tx, row.referrerPhone9, "telegram_then_sms", reach);
    await queueMessage(tx, {
      channel: target.channel ?? "telegram",
      phone9: row.referrerPhone9,
      chatId: target.channel === "telegram" ? target.chatId : null,
      locale,
      text,
      link: "/products",
      dedupeKey: `referral-reward:${row.id}`,
      skip: target.channel === null ? target.reason : undefined,
    });
    return reward;
  });
}

/** The friend's order was cancelled before delivery: the referral is void and the phone may be referred again. */
export async function cancelReferral(orderId: number): Promise<void> {
  await getDb().update(referrals).set({ status: "cancelled" }).where(and(eq(referrals.orderId, orderId), eq(referrals.status, "pending")));
}

/* ─── Admin ─────────────────────────────────────────────────────────── */

export interface ReferralStats {
  codes: number;
  referrals: number;
  rewarded: number;
  capped: number;
  pending: number;
  cancelled: number;
  revenue: number;
  discount: number;
  top: { phone9: string; code: string; name: string | null; referrals: number; rewarded: number; revenue: number }[];
}

export async function referralStats(): Promise<ReferralStats> {
  const db = getDb();
  const [totals] = (await db.execute(sql`
    select (select count(*) from referral_codes) as codes,
           count(*) as referrals,
           count(*) filter (where r.status = 'rewarded') as rewarded,
           count(*) filter (where r.status = 'capped') as capped,
           count(*) filter (where r.status = 'pending') as pending,
           count(*) filter (where r.status = 'cancelled') as cancelled,
           coalesce(sum(o.total) filter (where r.status <> 'cancelled'), 0) as revenue,
           coalesce(sum(r.discount) filter (where r.status <> 'cancelled'), 0) as discount
    from referrals r left join orders o on o.id = r.order_id`)) as unknown as Record<string, string>[];
  const top = (await db.execute(sql`
    select r.referrer_phone9 as phone9, r.code,
           (select o2.customer->>'name' from orders o2
             where right(regexp_replace(o2.customer->>'phone', '\\D', '', 'g'), 9) = r.referrer_phone9
             order by o2.created_at desc limit 1) as name,
           count(*) filter (where r.status <> 'cancelled') as referrals,
           count(*) filter (where r.status = 'rewarded') as rewarded,
           coalesce(sum(o.total) filter (where r.status <> 'cancelled'), 0) as revenue
    from referrals r left join orders o on o.id = r.order_id
    group by r.referrer_phone9, r.code
    order by referrals desc, revenue desc
    limit 10`)) as unknown as Record<string, string>[];
  return {
    codes: Number(totals?.codes ?? 0),
    referrals: Number(totals?.referrals ?? 0),
    rewarded: Number(totals?.rewarded ?? 0),
    capped: Number(totals?.capped ?? 0),
    pending: Number(totals?.pending ?? 0),
    cancelled: Number(totals?.cancelled ?? 0),
    revenue: Number(totals?.revenue ?? 0),
    discount: Number(totals?.discount ?? 0),
    top: top.map((t) => ({
      phone9: t.phone9,
      code: t.code,
      name: t.name ?? null,
      referrals: Number(t.referrals),
      rewarded: Number(t.rewarded),
      revenue: Number(t.revenue),
    })),
  };
}
