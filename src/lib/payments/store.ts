import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notifyOperator } from "@/lib/notifications/operator";
import { formatMoney } from "@/lib/utils";
import type { PaymentGateway, PaymentStatus } from "@/lib/db/schema";
import type { OrderRequest } from "@/lib/shopflow/types";

/*
  The payments table and the order's payment status, for both gateways.
  Marking a payment done and marking the order paid happen in one database
  transaction, with the order row locked: two callbacks racing for the same
  order (a retry, or Payme and Click at once) take turns, and the second one
  sees the first one's result.
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export interface PayableOrder {
  number: string;
  /** So'm. */
  total: number;
  status: string;
  paymentStatus: PaymentStatus;
  items: OrderRequest["items"];
  totals: OrderRequest["totals"];
  locale: string;
}

export interface PaymentRow {
  id: number;
  provider: PaymentGateway;
  providerTxId: string;
  orderNumber: string;
  amount: number;
  state: 1 | 2 | -1 | -2;
  reason: number | null;
  createTime: number;
  performTime: number | null;
  cancelTime: number | null;
  providerTime: number | null;
}

type RawPayment = {
  id: string | number;
  provider: PaymentGateway;
  provider_tx_id: string;
  order_number: string;
  amount: string | number;
  state: number;
  reason: number | null;
  create_time: string | number;
  perform_time: string | number | null;
  cancel_time: string | number | null;
  provider_time: string | number | null;
};

const n = (v: string | number | null) => (v == null ? null : Number(v));

function toRow(r: RawPayment): PaymentRow {
  return {
    id: Number(r.id),
    provider: r.provider,
    providerTxId: r.provider_tx_id,
    orderNumber: r.order_number,
    amount: Number(r.amount),
    state: Number(r.state) as PaymentRow["state"],
    reason: r.reason == null ? null : Number(r.reason),
    createTime: Number(r.create_time),
    performTime: n(r.perform_time),
    cancelTime: n(r.cancel_time),
    providerTime: n(r.provider_time),
  };
}

type RawOrder = { number: string; total: number; status: string; payment_status: PaymentStatus; items: OrderRequest["items"]; totals: OrderRequest["totals"]; locale: string };

function toOrder(r: RawOrder): PayableOrder {
  return { number: r.number, total: Number(r.total), status: r.status, paymentStatus: r.payment_status, items: r.items ?? [], totals: r.totals, locale: r.locale };
}

export async function findPayableOrder(number: string, exec: Db | Tx = getDb()): Promise<PayableOrder | null> {
  const rows = (await exec.execute(sql`
    select number, total, status, payment_status, items, totals, locale from orders where number = ${number} limit 1`)) as unknown as RawOrder[];
  return rows[0] ? toOrder(rows[0]) : null;
}

async function lockOrder(tx: Tx, number: string): Promise<PayableOrder | null> {
  const rows = (await tx.execute(sql`
    select number, total, status, payment_status, items, totals, locale from orders where number = ${number} for update`)) as unknown as RawOrder[];
  return rows[0] ? toOrder(rows[0]) : null;
}

export async function findPayment(provider: PaymentGateway, providerTxId: string): Promise<PaymentRow | null> {
  const rows = (await getDb().execute(sql`
    select * from payments where provider = ${provider} and provider_tx_id = ${providerTxId} limit 1`)) as unknown as RawPayment[];
  return rows[0] ? toRow(rows[0]) : null;
}

export async function findPaymentById(id: number): Promise<PaymentRow | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const rows = (await getDb().execute(sql`select * from payments where id = ${id} limit 1`)) as unknown as RawPayment[];
  return rows[0] ? toRow(rows[0]) : null;
}

export async function pendingPaymentForOrder(provider: PaymentGateway, number: string): Promise<PaymentRow | null> {
  const rows = (await getDb().execute(sql`
    select * from payments where provider = ${provider} and order_number = ${number} and state = 1
    order by id desc limit 1`)) as unknown as RawPayment[];
  return rows[0] ? toRow(rows[0]) : null;
}

export class OrderBusy extends Error {}

/**
 * A new created (state 1) payment. With `exclusive`, refused (OrderBusy) when
 * the order already has a created payment at this gateway — Payme allows one
 * open transaction per order.
 */
export async function insertPayment(
  p: { provider: PaymentGateway; providerTxId: string; orderNumber: string; amount: number; createTime: number; providerTime?: number | null; raw?: unknown },
  options: { exclusive?: boolean } = {},
): Promise<PaymentRow> {
  return getDb().transaction(async (tx) => {
    await lockOrder(tx, p.orderNumber);
    if (options.exclusive) {
      const open = (await tx.execute(sql`
        select 1 from payments where provider = ${p.provider} and order_number = ${p.orderNumber} and state = 1 limit 1`)) as unknown as unknown[];
      if (open.length > 0) throw new OrderBusy();
    }
    const rows = (await tx.execute(sql`
      insert into payments (provider, provider_tx_id, order_number, amount, state, create_time, provider_time, raw)
      values (${p.provider}, ${p.providerTxId}, ${p.orderNumber}, ${p.amount}, 1, ${p.createTime}, ${p.providerTime ?? null}, ${p.raw == null ? null : JSON.stringify(p.raw)}::jsonb)
      on conflict (provider, provider_tx_id) do update set updated_at = payments.updated_at
      returning *`)) as unknown as RawPayment[];
    return toRow(rows[0]);
  });
}

export class AlreadyPaid extends Error {}

/**
 * state 2 and the order paid, together. Refused (AlreadyPaid) when another
 * payment has paid the order in the meantime — the money of this one is not
 * taken (the gateway is answered with an error and cancels it).
 */
export async function completePayment(id: number, time: number): Promise<PaymentRow> {
  const result = await getDb().transaction(async (tx) => {
    const [current] = (await tx.execute(sql`select * from payments where id = ${id} for update`)) as unknown as RawPayment[];
    if (!current) throw new Error("payment not found");
    if (Number(current.state) === 2) return { row: toRow(current), fresh: false };
    const order = await lockOrder(tx, current.order_number);
    if (order?.paymentStatus === "paid") throw new AlreadyPaid();
    const [row] = (await tx.execute(sql`
      update payments set state = 2, perform_time = ${time}, updated_at = now(),
        -- Click takes the fiscal receipt after the payment (click-fiscal-server.ts).
        fiscal_status = case when provider = 'click' then 'pending' else fiscal_status end
      where id = ${id} returning *`)) as unknown as RawPayment[];
    await tx.execute(sql`
      update orders set payment_status = 'paid', paid_at = to_timestamp(${time} / 1000.0), updated_at = now()
      where number = ${current.order_number}`);
    return { row: toRow(row), fresh: true };
  });
  if (result.fresh) await announcePaid(result.row);
  return result.row;
}

/**
 * Cancelled: -1 before payment, -2 after it (a refund). A refund puts the
 * order to `refunded`; a cancelled unpaid attempt leaves the order waiting
 * for another one.
 */
export async function cancelPayment(id: number, time: number, reason: number | null, state: -1 | -2): Promise<PaymentRow> {
  const row = await getDb().transaction(async (tx) => {
    const [current] = (await tx.execute(sql`select * from payments where id = ${id} for update`)) as unknown as RawPayment[];
    if (!current) throw new Error("payment not found");
    if (Number(current.state) < 0) return toRow(current);
    await lockOrder(tx, current.order_number);
    const [updated] = (await tx.execute(sql`
      update payments set state = ${state}, cancel_time = ${time}, reason = ${reason}, updated_at = now()
      where id = ${id} returning *`)) as unknown as RawPayment[];
    if (state === -2) {
      await tx.execute(sql`
        update orders set payment_status = 'refunded', updated_at = now()
        where number = ${current.order_number} and payment_status = 'paid'`);
    }
    return toRow(updated);
  });
  if (state === -2) await notifyOperator(`↩️ #${row.orderNumber}: ${LABEL[row.provider]} toʻlovi qaytarildi — ${formatMoney(row.amount / 100, "uz")}`).catch(() => false);
  return row;
}

export async function paymentsBetween(provider: PaymentGateway, from: number, to: number): Promise<PaymentRow[]> {
  const rows = (await getDb().execute(sql`
    select * from payments where provider = ${provider} and create_time >= ${from} and create_time <= ${to}
    order by create_time asc`)) as unknown as RawPayment[];
  return rows.map(toRow);
}

export async function paymentsOfOrder(number: string): Promise<PaymentRow[]> {
  const rows = (await getDb().execute(sql`
    select * from payments where order_number = ${number} order by id asc`)) as unknown as RawPayment[];
  return rows.map(toRow);
}

/** MXIK and package codes of the order's products, by product id. */
export async function fiscalCodes(productIds: string[]): Promise<Map<string, { mxik: string | null; packageCode: string | null }>> {
  if (productIds.length === 0) return new Map();
  const ids = sql.join(productIds.map((id) => sql`${id}`), sql`, `);
  const rows = (await getDb().execute(sql`
    select id, mxik_code, package_code from products where id in (${ids})`)) as unknown as { id: string; mxik_code: string | null; package_code: string | null }[];
  return new Map(rows.map((r) => [r.id, { mxik: r.mxik_code, packageCode: r.package_code }]));
}

const LABEL: Record<PaymentGateway, string> = { payme: "Payme", click: "Click" };

async function announcePaid(row: PaymentRow) {
  await notifyOperator(`💳 #${row.orderNumber} toʻlandi — ${LABEL[row.provider]}, ${formatMoney(row.amount / 100, "uz")}. Kuryer naqd pul olmaydi.`).catch(() => false);
}


/* ---------- Click fiscal receipts (0036) ---------- */

export type ClickFiscalStatus = "pending" | "sent" | "failed" | "missing_codes";

export interface DueClickFiscal {
  id: number;
  clickTransId: string;
  orderNumber: string;
  attempts: number;
}

/** Performed Click payments whose receipt Click has not accepted yet, oldest first. */
export async function dueClickFiscal(maxAttempts: number, limit: number): Promise<DueClickFiscal[]> {
  const rows = (await getDb().execute(sql`
    select id, provider_tx_id, order_number, fiscal_attempts from payments
    where provider = 'click' and state = 2
      and fiscal_status in ('pending', 'failed', 'missing_codes') and fiscal_attempts < ${maxAttempts}
    order by id asc limit ${limit}`)) as unknown as { id: string | number; provider_tx_id: string; order_number: string; fiscal_attempts: number }[];
  return rows.map((r) => ({ id: Number(r.id), clickTransId: r.provider_tx_id, orderNumber: r.order_number, attempts: Number(r.fiscal_attempts) }));
}

/** A try's outcome. Only a call that reached Click counts as an attempt; missing codes wait for the admin. */
export async function recordClickFiscal(id: number, status: ClickFiscalStatus, error: string | null, attempted: boolean): Promise<void> {
  await getDb().execute(sql`
    update payments set fiscal_status = ${status}, fiscal_error = ${error},
      fiscal_attempts = fiscal_attempts + ${attempted ? 1 : 0},
      fiscal_sent_at = case when ${status} = 'sent' then now() else fiscal_sent_at end,
      updated_at = now()
    where id = ${id}`);
}
