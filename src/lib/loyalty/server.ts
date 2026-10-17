import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { loyaltyLedger, type LedgerKind } from "@/lib/db/schema";
import { phone9Of } from "@/lib/promo/rules";
import { evaluateLedger, reversibleAmount, type LedgerRow, type LedgerState } from "./ledger";
import { earnFor, lotExpiry, type LoyaltyRules } from "./model";
import { readLoyaltyRules } from "./settings";

/*
  The cashback ledger against the database.

  Every write for a phone happens under the same transaction-scoped advisory
  lock the order transaction takes (`gv-order-phone:<phone9>`), so an order
  spending points, a delivery earning them, a cancellation and the expiry
  job never interleave for one customer. Idempotency is in the schema: one
  earn and one redeem per order, each row reversed or expired at most once.
*/

type Db = ReturnType<typeof getDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Exec = Db | Tx;

export function phoneLockSql(phone9: string) {
  return sql`select pg_advisory_xact_lock(hashtext(${`gv-order-phone:${phone9}`}))`;
}

interface RawRow {
  id: string | number;
  delta: number;
  kind: LedgerKind;
  ref_id: string | number | null;
  expires_at: string | Date | null;
  created_at: string | Date;
}

const toDate = (v: string | Date) => (v instanceof Date ? v : new Date(v));

function rowOf(r: RawRow): LedgerRow {
  return {
    id: Number(r.id),
    delta: Number(r.delta),
    kind: r.kind,
    refId: r.ref_id == null ? null : Number(r.ref_id),
    expiresAt: r.expires_at ? toDate(r.expires_at) : null,
    createdAt: toDate(r.created_at),
  };
}

export async function ledgerRows(exec: Exec, phone9: string): Promise<LedgerRow[]> {
  const rows = (await exec.execute(sql`
    select id, delta, kind, ref_id, expires_at, created_at from loyalty_ledger
    where phone9 = ${phone9} order by created_at, id`)) as unknown as RawRow[];
  return rows.map(rowOf);
}

export async function ledgerState(exec: Exec, phone9: string, now = new Date()): Promise<LedgerState> {
  return evaluateLedger(await ledgerRows(exec, phone9), now);
}

/** The spendable balance of a phone (any format), 0 when unknown. */
export async function pointsBalance(phone: string, now = new Date()): Promise<number> {
  const phone9 = phone9Of(phone);
  if (!phone9) return 0;
  return Math.max(0, (await ledgerState(getDb(), phone9, now)).balance);
}

/** Writes the 'redeem' row of an order. Inside the order transaction, with the phone lock held. */
export async function writeRedemption(tx: Tx, input: { phone9: string; orderId: number; amount: number }): Promise<void> {
  await tx.insert(loyaltyLedger).values({ phone9: input.phone9, delta: -input.amount, kind: "redeem", orderId: input.orderId });
}

interface OrderRow {
  id: number;
  phone9: string | null;
  totals: { total: number; shipping: number };
}

async function orderByNumber(exec: Exec, number: string): Promise<OrderRow | null> {
  const rows = (await exec.execute(sql`
    select id, totals, right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) as phone9
    from orders where number = ${number} limit 1`)) as unknown as { id: string | number; totals: OrderRow["totals"]; phone9: string }[];
  const r = rows[0];
  if (!r) return null;
  return { id: Number(r.id), totals: r.totals, phone9: r.phone9 && r.phone9.length === 9 ? r.phone9 : null };
}

export type StatusOutcome = { earned: number; reversed: number; refunded: number; balance: number | null };

/** Delivered: the order earns its points (once). Returns the points written (0 when off, below the minimum or already earned). */
async function earnForOrder(tx: Tx, order: OrderRow, rules: LoyaltyRules, now: Date): Promise<number> {
  if (!order.phone9) return 0;
  const amount = earnFor(order.totals, rules);
  if (amount <= 0) return 0;
  const inserted = await tx
    .insert(loyaltyLedger)
    .values({ phone9: order.phone9, delta: amount, kind: "earn", orderId: order.id, expiresAt: lotExpiry(now, rules.expiryDays) })
    .onConflictDoNothing()
    .returning({ id: loyaltyLedger.id });
  return inserted.length > 0 ? amount : 0;
}

/**
 * Cancelled: every positive row tied to the order (its earn, a referral
 * bonus it paid) is taken back, and the points it spent are refunded as a
 * new lot. Each once — the unique index on ref_id makes a second click a no-op.
 */
async function unwindOrder(tx: Tx, orderId: number, rules: LoyaltyRules, now: Date): Promise<{ reversed: number; refunded: number }> {
  const linked = (await tx.execute(sql`
    select l.id, l.phone9, l.delta, l.kind from loyalty_ledger l
    where l.order_id = ${orderId} and l.kind in ('earn', 'redeem', 'adjust')
      and not exists (select 1 from loyalty_ledger r where r.ref_id = l.id and r.kind = 'reverse')
    order by l.id`)) as unknown as { id: string | number; phone9: string; delta: number; kind: LedgerKind }[];
  let reversed = 0;
  let refunded = 0;
  const locked = new Set<string>();
  for (const row of linked) {
    if (!locked.has(row.phone9)) {
      await tx.execute(phoneLockSql(row.phone9));
      locked.add(row.phone9);
    }
    const id = Number(row.id);
    if (row.delta > 0) {
      const amount = reversibleAmount(await ledgerRows(tx, row.phone9), id, now);
      if (amount <= 0) continue;
      const done = await tx
        .insert(loyaltyLedger)
        .values({ phone9: row.phone9, delta: -amount, kind: "reverse", orderId, refId: id, note: "Buyurtma bekor qilindi" })
        .onConflictDoNothing()
        .returning({ id: loyaltyLedger.id });
      if (done.length) reversed += amount;
    } else {
      const done = await tx
        .insert(loyaltyLedger)
        .values({
          phone9: row.phone9,
          delta: -row.delta,
          kind: "reverse",
          orderId,
          refId: id,
          note: "Buyurtma bekor qilindi — ball qaytarildi",
          expiresAt: lotExpiry(now, rules.expiryDays),
        })
        .onConflictDoNothing()
        .returning({ id: loyaltyLedger.id });
      if (done.length) refunded += -row.delta;
    }
  }
  return { reversed, refunded };
}

/**
 * An order changed status in the admin panel. Delivered earns, cancelled
 * unwinds (refunds spent points even when cashback has since been switched
 * off — they are the customer's). Never throws: the status change happened.
 */
export async function syncOrderLoyalty(orderNumber: string, from: string, to: string, now = new Date()): Promise<StatusOutcome | null> {
  if (from === to || (to !== "delivered" && to !== "cancelled")) return null;
  try {
    const rules = await readLoyaltyRules();
    return await getDb().transaction(async (tx) => {
      const order = await orderByNumber(tx, orderNumber);
      if (!order) return null;
      if (order.phone9) await tx.execute(phoneLockSql(order.phone9));
      const outcome: StatusOutcome = { earned: 0, reversed: 0, refunded: 0, balance: null };
      if (to === "delivered" && rules.enabled) outcome.earned = await earnForOrder(tx, order, rules, now);
      if (to === "cancelled") Object.assign(outcome, await unwindOrder(tx, order.id, rules, now));
      if (order.phone9 && (outcome.earned || outcome.reversed || outcome.refunded || rules.enabled)) {
        outcome.balance = (await ledgerState(tx, order.phone9, now)).balance;
      }
      return outcome;
    });
  } catch (err) {
    console.error(`[loyalty] order ${orderNumber} ${from}→${to} not applied:`, (err as Error).message);
    return null;
  }
}

/** A manual correction from the customer page (positive or negative), with a note. */
export async function adjustPoints(input: { phone9: string; delta: number; note: string; adminId: number }, now = new Date()): Promise<number> {
  const rules = await readLoyaltyRules();
  return getDb().transaction(async (tx) => {
    await tx.execute(phoneLockSql(input.phone9));
    await tx.insert(loyaltyLedger).values({
      phone9: input.phone9,
      delta: input.delta,
      kind: "adjust",
      note: input.note.slice(0, 300),
      createdBy: input.adminId,
      expiresAt: input.delta > 0 ? lotExpiry(now, rules.expiryDays) : null,
    });
    return (await ledgerState(tx, input.phone9, now)).balance;
  });
}

const EXPIRE_LOCK = 7_340_021;

/**
 * Writes 'expire' rows for lots whose end date passed. The balance already
 * treats them as gone (evaluated lazily); this keeps the plain sum and the
 * liability figure honest. Also drops one-time codes older than a day.
 */
export async function expirePoints(now = new Date(), limit = 200): Promise<{ phones: number; rows: number; locked: boolean }> {
  const db = getDb();
  const lock = await db.transaction(async (tx) => {
    const ok = (await tx.execute(sql`select pg_try_advisory_xact_lock(${EXPIRE_LOCK}) as ok`)) as unknown as { ok: boolean }[];
    if (!ok[0]?.ok) return null;
    await tx.execute(sql`delete from loyalty_otps where created_at < ${new Date(now.getTime() - 86_400_000).toISOString()}::timestamptz`);
    const due = (await tx.execute(sql`
      select distinct l.phone9 from loyalty_ledger l
      where l.delta > 0 and l.kind <> 'expire' and l.expires_at <= ${now.toISOString()}::timestamptz
        and not exists (select 1 from loyalty_ledger x where x.ref_id = l.id and x.kind = 'expire')
      limit ${limit}`)) as unknown as { phone9: string }[];
    return due.map((d) => d.phone9);
  });
  if (!lock) return { phones: 0, rows: 0, locked: false };
  let rows = 0;
  for (const phone9 of lock) {
    rows += await db.transaction(async (tx) => {
      await tx.execute(phoneLockSql(phone9));
      const state = evaluateLedger(await ledgerRows(tx, phone9), now);
      let n = 0;
      for (const e of state.toExpire) {
        const done = await tx
          .insert(loyaltyLedger)
          .values({ phone9, delta: -e.amount, kind: "expire", refId: e.lotId, note: "Muddati tugadi" })
          .onConflictDoNothing()
          .returning({ id: loyaltyLedger.id });
        n += done.length;
      }
      return n;
    });
  }
  return { phones: lock.length, rows, locked: true };
}

/* ─── Admin reads ────────────────────────────────────────────────────── */

export interface LedgerEntry {
  id: number;
  delta: number;
  kind: LedgerKind;
  note: string | null;
  orderNumber: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  adminName: string | null;
}

export async function customerLoyalty(phone9: string, now = new Date()): Promise<{ state: LedgerState; entries: LedgerEntry[] }> {
  const db = getDb();
  const [state, rows] = await Promise.all([
    ledgerState(db, phone9, now),
    db.execute(sql`
      select l.id, l.delta, l.kind, l.note, o.number as order_number, l.expires_at, l.created_at, a.name as admin_name
      from loyalty_ledger l
      left join orders o on o.id = l.order_id
      left join admin_users a on a.id = l.created_by
      where l.phone9 = ${phone9}
      order by l.created_at desc, l.id desc
      limit 100`) as unknown as Promise<Record<string, unknown>[]>,
  ]);
  return {
    state,
    entries: rows.map((r) => ({
      id: Number(r.id),
      delta: Number(r.delta),
      kind: r.kind as LedgerKind,
      note: (r.note as string) ?? null,
      orderNumber: (r.order_number as string) ?? null,
      expiresAt: r.expires_at ? toDate(r.expires_at as string) : null,
      createdAt: toDate(r.created_at as string),
      adminName: (r.admin_name as string) ?? null,
    })),
  };
}

export interface LoyaltyStats {
  issued: number;
  redeemed: number;
  expired: number;
  reversed: number;
  /** Points customers hold right now (unexpired) — the shop's liability in soʻm. */
  outstanding: number;
  holders: number;
  issued30: number;
  redeemed30: number;
  ordersWithPoints30: number;
}

export async function loyaltyStats(now = new Date()): Promise<LoyaltyStats> {
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const [row] = (await getDb().execute(sql`
    select
      coalesce(sum(delta) filter (where kind = 'earn' or (kind = 'adjust' and delta > 0)), 0) as issued,
      coalesce(-sum(delta) filter (where kind = 'redeem'), 0) as redeemed,
      coalesce(-sum(delta) filter (where kind = 'expire'), 0) as expired,
      coalesce(sum(delta) filter (where kind = 'reverse'), 0) as reversed,
      coalesce(sum(delta) filter (where (kind = 'earn' or (kind = 'adjust' and delta > 0)) and created_at >= ${since}::timestamptz), 0) as issued30,
      coalesce(-sum(delta) filter (where kind = 'redeem' and created_at >= ${since}::timestamptz), 0) as redeemed30,
      count(distinct order_id) filter (where kind = 'redeem' and created_at >= ${since}::timestamptz) as orders30
    from loyalty_ledger`)) as unknown as Record<string, string>[];

  // Outstanding is evaluated per phone (expiry is lazy), not a plain sum.
  const phones = (await getDb().execute(sql`select distinct phone9 from loyalty_ledger`)) as unknown as { phone9: string }[];
  let outstanding = 0;
  let holders = 0;
  for (const { phone9 } of phones) {
    const b = (await ledgerState(getDb(), phone9, now)).balance;
    if (b > 0) {
      outstanding += b;
      holders += 1;
    }
  }
  return {
    issued: Number(row?.issued ?? 0),
    redeemed: Number(row?.redeemed ?? 0),
    expired: Number(row?.expired ?? 0),
    reversed: Number(row?.reversed ?? 0),
    outstanding,
    holders,
    issued30: Number(row?.issued30 ?? 0),
    redeemed30: Number(row?.redeemed30 ?? 0),
    ordersWithPoints30: Number(row?.orders30 ?? 0),
  };
}
