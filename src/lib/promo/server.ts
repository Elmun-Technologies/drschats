import "server-only";

import { randomInt } from "node:crypto";
import { and, count, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, promoCodes, promoRedemptions, type PromoSource } from "@/lib/db/schema";
import { orderValues, refreshStockPages } from "@/lib/catalog/db";
import { StockShortage, takeStock } from "@/lib/catalog/stock";
import type { OrderAdjustment, OrderRequest, Promotion } from "@/lib/shopflow/types";
import {
  applyAdjustment,
  applyPoints,
  chooseAdjustment,
  evaluatePromo,
  firstOrderDiscount,
  generatePromoCode,
  normalizePromoCode,
  phone9Of,
  type PromoCheck,
  type PromoDefinition,
  type PromoLine,
  type PromoRejection,
} from "./rules";
import { readFirstOrderSetting } from "./settings";
import { getCommerceSettings } from "@/lib/commerce/server";
import { pricingRulesOf } from "@/lib/commerce/settings";
import { isReferralCode, type ReferralRejection } from "@/lib/referral/rules";
import { quoteReferral, recordReferral, referralOwner } from "@/lib/referral/server";
import { readLoyaltyRules } from "@/lib/loyalty/settings";
import { earnFor, maxRedeemable, paidGoods } from "@/lib/loyalty/model";
import { ledgerState, writeRedemption } from "@/lib/loyalty/server";
import { readRedeemToken } from "@/lib/loyalty/otp-server";

/*
  Promo codes and the first-order discount against the database.

  Everything here runs only when orders are rows in our own database
  (ORDERS_IN_DB): a code has to be counted somewhere, and "is this the first
  order from this phone?" can only be answered from the order history.
  Without the database the checkout keeps the old behaviour — a note, and
  the operator applies the first-order discount by hand.
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Exec = Db | Tx;

export function toDefinition(row: typeof promoCodes.$inferSelect): PromoDefinition {
  return {
    code: row.code,
    kind: row.kind,
    value: row.value,
    minSubtotal: row.minSubtotal,
    maxUses: row.maxUses,
    uses: row.uses,
    perPhoneLimit: row.perPhoneLimit,
    phone9: row.phone9,
    productSlugs: row.productSlugs && row.productSlugs.length > 0 ? row.productSlugs : null,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    active: row.active,
  };
}

/** The order's lines in the shape the rules read: catalogue prices (after repricing), offer and subscription flags. */
export function promoLinesOf(items: OrderRequest["items"]): PromoLine[] {
  return items.map((i) => ({
    slug: i.slug,
    price: i.unitPrice,
    quantity: i.quantity,
    upsellDiscountPercent: i.upsellDiscountPercent,
    subscription: i.subscription,
  }));
}

async function phoneUses(exec: Exec, code: string, phone9: string): Promise<number> {
  const [row] = await exec
    .select({ n: count() })
    .from(promoRedemptions)
    .where(and(eq(promoRedemptions.code, code), eq(promoRedemptions.phone9, phone9)));
  return row?.n ?? 0;
}

/** Orders already placed from this phone that were not cancelled. */
export async function previousOrders(exec: Exec, phone9: string): Promise<number> {
  const [row] = await exec
    .select({ n: count() })
    .from(orders)
    .where(and(sql`${orders.status} <> 'cancelled'`, sql`right(regexp_replace(${orders.customer}->>'phone', '\\D', '', 'g'), 9) = ${phone9}`));
  return row?.n ?? 0;
}

/** A referral code's rejection, in the promo field's vocabulary. */
export function referralReason(reason: ReferralRejection): Exclude<PromoRejection["reason"], "min_subtotal"> {
  if (reason === "self") return "referral_self";
  if (reason === "not_first" || reason === "already_referred") return "referral_not_first";
  if (reason === "needs_phone") return "wrong_phone";
  return "not_found";
}

/** A typed code that is a customer's referral code (and exists) — otherwise it is read as a promo code. */
async function isLiveReferral(exec: Exec, code: string): Promise<boolean> {
  return isReferralCode(code) && (await referralOwner(exec, code)) !== null;
}

export type FirstOrderState = "applies" | "returning" | "needs_phone" | "off";

export interface DiscountQuote {
  /** The entered code's verdict, or null when none was entered. */
  promo: (PromoCheck & { code?: string }) | null;
  firstOrder: { state: FirstOrderState; percent: number; amount: number };
  /** The one discount the order will get. */
  applied: OrderAdjustment | null;
}

/**
 * What the cart will be discounted, for the preview. The order transaction
 * runs the same rules again with the code row locked; this one only reads.
 */
export async function quoteDiscounts({
  lines,
  promotions,
  code: rawCode,
  phone,
}: {
  lines: PromoLine[];
  promotions: Promotion[];
  code?: string | null;
  phone?: string | null;
}): Promise<DiscountQuote> {
  const db = getDb();
  const phone9 = phone9Of(phone);
  const [setting, commerce, loyalty] = await Promise.all([readFirstOrderSetting(), getCommerceSettings(), readLoyaltyRules()]);
  const pricing = pricingRulesOf(commerce);

  let promo: DiscountQuote["promo"] = null;
  let referralPercent: number | undefined;
  if (rawCode) {
    const code = normalizePromoCode(rawCode);
    if (!code) promo = { ok: false, reason: "invalid_format" };
    else if (await isLiveReferral(db, code)) {
      const q = await quoteReferral(db, { code, phone9, lines, promotions, rules: loyalty });
      if (q.ok && q.discount > 0) {
        promo = { ok: true, code, discount: q.discount, eligibleSubtotal: q.discount };
        referralPercent = q.percent;
      } else promo = { ok: false, code, reason: q.ok ? "not_applicable" : referralReason(q.reason) };
    } else {
      const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      const uses = row && phone9 ? await phoneUses(db, code, phone9) : 0;
      promo = { ...evaluatePromo(row ? toDefinition(row) : null, { lines, promotions, pricing, phone9, phoneUses: uses }), code };
    }
  }

  const amount = firstOrderDiscount(lines, promotions, setting.percent);
  let state: FirstOrderState = "off";
  if (setting.enabled) state = !phone9 ? "needs_phone" : (await previousOrders(db, phone9)) === 0 ? "applies" : "returning";

  const applied = chooseAdjustment(
    promo?.ok ? { code: promo.code, discount: promo.discount, referralPercent } : null,
    state === "applies" ? { percent: setting.percent, amount } : null,
  );
  return { promo, firstOrder: { state, percent: setting.percent, amount }, applied };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; order: OrderRequest; pointsEarn: number }
  | { ok: false; error: "points_invalid" }
  | { ok: false; error: "promo_invalid"; code: string; rejection: PromoRejection }
  | { ok: false; error: "insufficient_stock"; slug?: string; available: number }
  | { ok: false; error: "failed" };

class PointsRejected extends Error {
  constructor() {
    super("points rejected");
  }
}

class PromoRejected extends Error {
  constructor(readonly code: string, readonly rejection: PromoRejection) {
    super("promo rejected");
  }
}

/**
 * Store a repriced order with its order-level discount, atomically.
 *
 * One transaction: a lock on the phone (two first orders from one number
 * sent at once must not both be "first"), the code row locked FOR UPDATE
 * (two orders racing for the last use of a code take turns), the limits
 * checked again, the order inserted, the redemption recorded and `uses`
 * incremented. A code that stopped being valid since the cart checked it
 * rolls everything back and is reported, so the cart can drop it and the
 * customer resubmits knowingly.
 */
export async function placeOrder(order: OrderRequest, promotions: Promotion[]): Promise<PlaceOrderResult> {
  const phone9 = phone9Of(order.customer.phone);
  const code = order.promoCode ? normalizePromoCode(order.promoCode) : null;
  if (order.promoCode && !code) return { ok: false, error: "promo_invalid", code: order.promoCode, rejection: { reason: "invalid_format" } };
  const lines = promoLinesOf(order.items);
  const [setting, commerce, loyalty] = await Promise.all([readFirstOrderSetting(), getCommerceSettings(), readLoyaltyRules()]);
  const pricing = pricingRulesOf(commerce);
  // Spending points needs the token from the SMS code, for this very phone.
  const pointsToken = order.pointsToken ? readRedeemToken(order.pointsToken, phone9) : null;
  if (order.pointsToken && (!pointsToken || !loyalty.enabled)) return { ok: false, error: "points_invalid" };

  let stockChanged: string[] = [];
  try {
    const placed = await getDb().transaction(async (tx) => {
      if (phone9) await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`gv-order-phone:${phone9}`}))`);

      let promo: { code: string; discount: number; referralPercent?: number } | null = null;
      let referral: { code: string; referrer: string } | null = null;
      if (code && (await isLiveReferral(tx, code))) {
        if (!phone9) throw new PromoRejected(code, { reason: "wrong_phone" });
        const q = await quoteReferral(tx, { code, phone9, lines, promotions, rules: loyalty });
        if (!q.ok) throw new PromoRejected(code, { reason: referralReason(q.reason) } as PromoRejection);
        if (q.discount <= 0) throw new PromoRejected(code, { reason: "not_applicable" });
        promo = { code, discount: q.discount, referralPercent: q.percent };
        referral = { code, referrer: q.referrer };
      } else if (code) {
        const [row] = await tx.select().from(promoCodes).where(eq(promoCodes.code, code)).for("update");
        // Redemptions are counted per phone, so a code needs one (the order form always sends it).
        if (!phone9) throw new PromoRejected(code, { reason: "wrong_phone" });
        const uses = row ? await phoneUses(tx, code, phone9) : 0;
        const check = evaluatePromo(row ? toDefinition(row) : null, { lines, promotions, pricing, phone9, phoneUses: uses });
        if (!check.ok) {
          const { ok: _ok, ...rejection } = check;
          throw new PromoRejected(code, rejection as PromoRejection);
        }
        promo = { code, discount: check.discount };
      }

      const firstOrder =
        setting.enabled && phone9 && (await previousOrders(tx, phone9)) === 0
          ? { percent: setting.percent, amount: firstOrderDiscount(lines, promotions, setting.percent) }
          : null;
      const adjustment = chooseAdjustment(promo, firstOrder);
      let totals = applyAdjustment(order.totals, adjustment);
      /*
        Points come last: they are a payment, not a discount, so they stack
        with the promo code / first-order discount and are measured after it.
        The phone lock above also serialises this phone's ledger.
      */
      let points = 0;
      if (pointsToken && phone9) {
        const balance = (await ledgerState(tx, phone9)).balance;
        points = maxRedeemable({ balance, goods: paidGoods(totals), maxSharePercent: loyalty.maxSharePercent, cap: pointsToken.c });
        if (points <= 0) throw new PointsRejected();
        totals = applyPoints(totals, points);
      }
      const final: OrderRequest = { ...order, promoCode: undefined, pointsToken: undefined, totals };
      const usedCode = adjustment?.kind === "promo" || adjustment?.kind === "referral" ? adjustment.code : null;

      const [saved] = await tx.insert(orders).values(orderValues(final, usedCode)).returning({ id: orders.id, number: orders.number });
      // Tracked stock goes down in the same transaction: a short shelf rolls back the order and the redemption.
      stockChanged = await takeStock(tx, saved.id, final.items);
      if (adjustment?.kind === "promo" && phone9) {
        await tx.insert(promoRedemptions).values({ code: adjustment.code, orderId: saved.id, phone9, discount: adjustment.amount });
        await tx.update(promoCodes).set({ uses: sql`${promoCodes.uses} + 1` }).where(eq(promoCodes.code, adjustment.code));
      }
      if (points > 0 && phone9) await writeRedemption(tx, { phone9, orderId: saved.id, amount: points });
      // The friend came with the code even when the first-order discount won the tie: the referral counts.
      if (referral && phone9) {
        await recordReferral(tx, {
          code: referral.code,
          referrer: referral.referrer,
          referred: phone9,
          orderId: saved.id,
          discount: adjustment?.kind === "referral" ? adjustment.amount : 0,
        });
      }
      return { ok: true as const, orderId: saved.number ?? String(saved.id), order: final, pointsEarn: earnFor(final.totals, loyalty) };
    });
    if (stockChanged.length > 0) refreshStockPages(order.items.filter((i) => stockChanged.includes(i.productId)).map((i) => i.slug));
    return placed;
  } catch (err) {
    if (err instanceof PointsRejected) return { ok: false, error: "points_invalid" };
    if (err instanceof PromoRejected) return { ok: false, error: "promo_invalid", code: err.code, rejection: err.rejection };
    if (err instanceof StockShortage) {
      const line = order.items.find((i) => i.productId === err.productId);
      return { ok: false, error: "insufficient_stock", slug: line?.slug, available: err.available };
    }
    console.error("[orders] insert failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}

export interface IssuePromoCodeOptions {
  kind: "percent" | "fixed";
  /** Percent (1–90) or a sum in soʻm. */
  value: number;
  /** Bind the code to one customer (any phone format; the last 9 digits are kept). */
  phone?: string | null;
  /** Lifetime from now; omitted or 0 — no end date. */
  ttlHours?: number;
  source: PromoSource;
  campaignId?: string | null;
  minSubtotal?: number | null;
  /** Total redemptions; default 1 — a personal, single-use code. */
  maxUses?: number | null;
  productSlugs?: string[] | null;
  note?: string | null;
  /** Code prefix, default "GV". */
  prefix?: string;
}

/**
 * Create a readable unique code (`GV-7K3P9Q`) and return it.
 *
 * The entry point for every automated flow — SMS/Telegram campaigns, the
 * referral and birthday flows: they call this, then send the code. It
 * retries on the (rare) collision with an existing code.
 */
export async function issuePromoCode(opts: IssuePromoCodeOptions): Promise<string> {
  if (!Number.isInteger(opts.value) || opts.value <= 0 || (opts.kind === "percent" && opts.value > 90)) {
    throw new Error("issuePromoCode: value out of range");
  }
  const phone9 = opts.phone ? phone9Of(opts.phone) : null;
  if (opts.phone && !phone9) throw new Error("issuePromoCode: phone must have 9+ digits");
  const endsAt = opts.ttlHours && opts.ttlHours > 0 ? new Date(Date.now() + opts.ttlHours * 3_600_000) : null;
  const db = getDb();
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generatePromoCode(randomInt, opts.prefix ?? "GV");
    const inserted = await db
      .insert(promoCodes)
      .values({
        code,
        kind: opts.kind,
        value: opts.value,
        minSubtotal: opts.minSubtotal ?? null,
        maxUses: opts.maxUses === undefined ? 1 : opts.maxUses,
        perPhoneLimit: 1,
        phone9,
        productSlugs: opts.productSlugs && opts.productSlugs.length > 0 ? opts.productSlugs : null,
        endsAt,
        source: opts.source,
        campaignId: opts.campaignId ?? null,
        note: opts.note ?? null,
      })
      .onConflictDoNothing()
      .returning({ code: promoCodes.code });
    if (inserted.length > 0) return inserted[0].code;
  }
  throw new Error("issuePromoCode: could not find a free code");
}

/**
 * `count` single-use codes sharing one campaign id, for an SMS or Telegram
 * send-out (exported as CSV from /admin/promocodes). Returns the codes.
 */
export async function issuePromoCodeBatch(
  count: number,
  opts: Omit<IssuePromoCodeOptions, "phone" | "maxUses"> & { campaignId: string },
): Promise<string[]> {
  if (!Number.isInteger(count) || count < 1 || count > 2000) throw new Error("issuePromoCodeBatch: 1–2000 codes");
  if (!Number.isInteger(opts.value) || opts.value <= 0 || (opts.kind === "percent" && opts.value > 90)) {
    throw new Error("issuePromoCodeBatch: value out of range");
  }
  const endsAt = opts.ttlHours && opts.ttlHours > 0 ? new Date(Date.now() + opts.ttlHours * 3_600_000) : null;
  const db = getDb();
  const issued: string[] = [];
  for (let round = 0; round < 8 && issued.length < count; round++) {
    const fresh = new Set<string>();
    while (fresh.size < count - issued.length) fresh.add(generatePromoCode(randomInt, opts.prefix ?? "GV"));
    const values = [...fresh].map((code) => ({
      code,
      kind: opts.kind,
      value: opts.value,
      minSubtotal: opts.minSubtotal ?? null,
      maxUses: 1,
      perPhoneLimit: 1,
      productSlugs: opts.productSlugs && opts.productSlugs.length > 0 ? opts.productSlugs : null,
      endsAt,
      source: opts.source,
      campaignId: opts.campaignId,
      note: opts.note ?? null,
    }));
    for (let i = 0; i < values.length; i += 500) {
      const rows = await db.insert(promoCodes).values(values.slice(i, i + 500)).onConflictDoNothing().returning({ code: promoCodes.code });
      issued.push(...rows.map((r) => r.code));
    }
  }
  return issued;
}
