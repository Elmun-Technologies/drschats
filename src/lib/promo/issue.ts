import "server-only";

import { randomInt } from "node:crypto";
import { and, count, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ORDER_PHONE9 } from "@/lib/db/phone";
import { orders, promoCodes, type PromoSource } from "@/lib/db/schema";
import { generatePromoCode, phone9Of } from "./rules";

/*
  Issuing promo codes and counting a phone's orders — the two things the
  referral, messaging and admin modules need from the promo layer. Kept apart
  from lib/promo/server.ts (the order transaction), which itself uses the
  referral module: importing it from there made an import cycle.
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type Exec = Db | Tx;

/** Orders already placed from this phone that were not cancelled. */
export async function previousOrders(exec: Exec, phone9: string): Promise<number> {
  const [row] = await exec
    .select({ n: count() })
    .from(orders)
    .where(and(sql`${orders.status} <> 'cancelled'`, sql`${ORDER_PHONE9} = ${phone9}`));
  return row?.n ?? 0;
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
