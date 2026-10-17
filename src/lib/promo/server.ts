import "server-only";

import { randomInt } from "node:crypto";
import { and, count, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, promoCodes, promoRedemptions, type PromoSource } from "@/lib/db/schema";
import { orderValues } from "@/lib/catalog/db";
import type { OrderAdjustment, OrderRequest, Promotion } from "@/lib/shopflow/types";
import {
  applyAdjustment,
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
  const setting = await readFirstOrderSetting();

  let promo: DiscountQuote["promo"] = null;
  if (rawCode) {
    const code = normalizePromoCode(rawCode);
    if (!code) promo = { ok: false, reason: "invalid_format" };
    else {
      const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      const uses = row && phone9 ? await phoneUses(db, code, phone9) : 0;
      promo = { ...evaluatePromo(row ? toDefinition(row) : null, { lines, promotions, phone9, phoneUses: uses }), code };
    }
  }

  const amount = firstOrderDiscount(lines, promotions, setting.percent);
  let state: FirstOrderState = "off";
  if (setting.enabled) state = !phone9 ? "needs_phone" : (await previousOrders(db, phone9)) === 0 ? "applies" : "returning";

  const applied = chooseAdjustment(
    promo?.ok ? { code: promo.code, discount: promo.discount } : null,
    state === "applies" ? { percent: setting.percent, amount } : null,
  );
  return { promo, firstOrder: { state, percent: setting.percent, amount }, applied };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; order: OrderRequest }
  | { ok: false; error: "promo_invalid"; code: string; rejection: PromoRejection }
  | { ok: false; error: "failed" };

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
  const setting = await readFirstOrderSetting();

  try {
    return await getDb().transaction(async (tx) => {
      if (phone9) await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`gv-order-phone:${phone9}`}))`);

      let promo: { code: string; discount: number } | null = null;
      if (code) {
        const [row] = await tx.select().from(promoCodes).where(eq(promoCodes.code, code)).for("update");
        // Redemptions are counted per phone, so a code needs one (the order form always sends it).
        if (!phone9) throw new PromoRejected(code, { reason: "wrong_phone" });
        const uses = row ? await phoneUses(tx, code, phone9) : 0;
        const check = evaluatePromo(row ? toDefinition(row) : null, { lines, promotions, phone9, phoneUses: uses });
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
      const final: OrderRequest = { ...order, promoCode: undefined, totals: applyAdjustment(order.totals, adjustment) };
      const usedCode = adjustment?.kind === "promo" ? adjustment.code : null;

      const [saved] = await tx.insert(orders).values(orderValues(final, usedCode)).returning({ id: orders.id, number: orders.number });
      if (adjustment?.kind === "promo" && phone9) {
        await tx.insert(promoRedemptions).values({ code: adjustment.code, orderId: saved.id, phone9, discount: adjustment.amount });
        await tx.update(promoCodes).set({ uses: sql`${promoCodes.uses} + 1` }).where(eq(promoCodes.code, adjustment.code));
      }
      return { ok: true as const, orderId: saved.number ?? String(saved.id), order: final };
    });
  } catch (err) {
    if (err instanceof PromoRejected) return { ok: false, error: "promo_invalid", code: err.code, rejection: err.rejection };
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
