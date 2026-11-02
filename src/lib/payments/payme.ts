/*
  Payme Merchant API (JSON-RPC 2.0) — the protocol only. Payme calls us;
  every answer is HTTP 200 with either `result` or `error`. Storage is behind
  PaymeStore (payme-store.ts) so the rules here are tested without a database.

  Docs: developer.help.paycom.uz → Методы Merchant API, Ошибки, Песочница.
  - Auth: Authorization: Basic base64("Paycom:" + key); the sandbox key in test mode.
  - Amounts are tiyin (1/100 so'm). Times are milliseconds.
  - States: 1 created, 2 performed, -1 cancelled before payment, -2 cancelled after.
  - An unperformed transaction expires 12 h (43 200 000 ms) after it was created.
  - CreateTransaction / PerformTransaction / CancelTransaction are sent twice:
    a repeated call must return the first answer.
  - Account errors are -31050…-31099 and carry the account field name in `data`.
*/

export const PAYME_TIMEOUT_MS = 43_200_000;

type Localized = { ru: string; uz: string; en: string };

export interface PaymeError {
  code: number;
  message: Localized;
  data?: string;
}

const msg = (ru: string, uz: string, en: string): Localized => ({ ru, uz, en });

export const PAYME_ERRORS = {
  auth: { code: -32504, message: msg("Недостаточно привилегий для выполнения метода", "Usulni bajarish uchun huquq yetarli emas", "Insufficient privileges") },
  parse: { code: -32700, message: msg("Ошибка парсинга JSON", "JSON tahlil xatosi", "Parse error") },
  request: { code: -32600, message: msg("Неверный запрос", "Notoʻgʻri soʻrov", "Invalid request") },
  method: { code: -32601, message: msg("Метод не найден", "Usul topilmadi", "Method not found") },
  system: { code: -32400, message: msg("Системная ошибка", "Tizim xatosi", "System error") },
  amount: { code: -31001, message: msg("Неверная сумма", "Notoʻgʻri summa", "Invalid amount") },
  notFoundTx: { code: -31003, message: msg("Транзакция не найдена", "Tranzaksiya topilmadi", "Transaction not found") },
  cannotCancel: { code: -31007, message: msg("Заказ выполнен. Невозможно отменить транзакцию", "Buyurtma bajarilgan. Tranzaksiyani bekor qilib boʻlmaydi", "Order is fulfilled, the transaction cannot be cancelled") },
  cannotPerform: { code: -31008, message: msg("Невозможно выполнить данную операцию", "Bu amalni bajarib boʻlmaydi", "Unable to perform the operation") },
  orderNotFound: { code: -31050, message: msg("Неверный код заказа", "Buyurtma raqami notoʻgʻri", "Order not found") },
  orderClosed: { code: -31051, message: msg("Заказ уже оплачен или отменён", "Buyurtma toʻlangan yoki bekor qilingan", "Order is already paid or cancelled") },
  orderBusy: { code: -31099, message: msg("Заказ ожидает оплаты другой транзакцией", "Buyurtma boshqa tranzaksiya bilan toʻlanmoqda", "Order is awaiting another transaction") },
} satisfies Record<string, PaymeError>;

export interface PaymeOrder {
  number: string;
  /** What the customer owes, tiyin. */
  amount: number;
  /** Order status: new / confirmed / shipped / delivered / cancelled. */
  status: string;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded";
}

export interface PaymeTx {
  id: string;
  /** Our row id — Payme's "transaction" field. */
  transaction: string;
  orderNumber: string;
  amount: number;
  state: 1 | 2 | -1 | -2;
  reason: number | null;
  createTime: number;
  performTime: number | null;
  cancelTime: number | null;
  providerTime: number;
}

export interface PaymeStore {
  findOrder(number: string): Promise<PaymeOrder | null>;
  findTx(id: string): Promise<PaymeTx | null>;
  /** A created (state 1) transaction for the order, if any. */
  pendingTxForOrder(number: string): Promise<PaymeTx | null>;
  createTx(tx: Omit<PaymeTx, "transaction" | "performTime" | "cancelTime" | "reason" | "state">): Promise<PaymeTx>;
  /** state 2, perform_time; the order is marked paid in the same database transaction. */
  performTx(id: string, time: number): Promise<PaymeTx>;
  /** state -1 or -2, cancel_time, reason; the order's payment status follows. */
  cancelTx(id: string, time: number, reason: number, state: -1 | -2): Promise<PaymeTx>;
  statement(from: number, to: number): Promise<PaymeTx[]>;
  changeKey(password: string): Promise<void>;
}

export interface PaymeContext {
  /** The key Basic auth must carry (sandbox key in test mode). */
  key: string;
  /** The account field configured in Payme Business (default "order_id"). */
  account: string;
  store: PaymeStore;
  now: () => number;
  /** Fiscal receipt for CheckPerformTransaction, when every line has its MXIK code. */
  detail?: (order: PaymeOrder) => Promise<object | null>;
}

export class PaymeFault extends Error {
  constructor(readonly error: PaymeError) {
    super(error.message.en);
  }
}

const fault = (error: PaymeError, data?: string) => new PaymeFault(data ? { ...error, data } : error);

type Params = Record<string, unknown>;
export type PaymeResponse = { jsonrpc: "2.0"; id: unknown; result: unknown } | { jsonrpc: "2.0"; id: unknown; error: PaymeError };

/** Constant-time-ish comparison of the Basic auth header with the expected key. */
export function paymeAuthorized(header: string | null, key: string): boolean {
  if (!header || !key) return false;
  const match = /^Basic\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }
  const expected = `Paycom:${key}`;
  if (decoded.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= decoded.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function handlePayme(rawBody: string, authHeader: string | null, ctx: PaymeContext): Promise<PaymeResponse> {
  let body: { id?: unknown; method?: unknown; params?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { jsonrpc: "2.0", id: null, error: PAYME_ERRORS.parse };
  }
  const id = body?.id ?? null;
  // Auth is checked before anything about the request is revealed.
  if (!paymeAuthorized(authHeader, ctx.key)) return { jsonrpc: "2.0", id, error: PAYME_ERRORS.auth };
  if (typeof body?.method !== "string" || !body.params || typeof body.params !== "object") {
    return { jsonrpc: "2.0", id, error: PAYME_ERRORS.request };
  }
  try {
    const result = await dispatch(body.method, body.params as Params, ctx);
    return { jsonrpc: "2.0", id, result };
  } catch (err) {
    if (err instanceof PaymeFault) return { jsonrpc: "2.0", id, error: err.error };
    console.error("[payme] handler failed:", (err as Error).message);
    return { jsonrpc: "2.0", id, error: PAYME_ERRORS.system };
  }
}

async function dispatch(method: string, params: Params, ctx: PaymeContext): Promise<unknown> {
  switch (method) {
    case "CheckPerformTransaction":
      return checkPerform(params, ctx);
    case "CreateTransaction":
      return create(params, ctx);
    case "PerformTransaction":
      return perform(params, ctx);
    case "CancelTransaction":
      return cancel(params, ctx);
    case "CheckTransaction":
      return check(params, ctx);
    case "GetStatement":
      return statement(params, ctx);
    case "ChangePassword":
      return changePassword(params, ctx);
    default:
      throw fault(PAYME_ERRORS.method);
  }
}

function num(params: Params, key: string): number {
  const value = params[key];
  if (typeof value !== "number" || !Number.isFinite(value)) throw fault(PAYME_ERRORS.request);
  return value;
}

function str(params: Params, key: string): string {
  const value = params[key];
  if (typeof value !== "string" || !value) throw fault(PAYME_ERRORS.request);
  return value;
}

/** The order the request is about, and that it can be paid with exactly this amount. */
async function payableOrder(params: Params, ctx: PaymeContext): Promise<PaymeOrder> {
  const amount = num(params, "amount");
  const account = params.account as Record<string, unknown> | undefined;
  const number = typeof account?.[ctx.account] === "string" || typeof account?.[ctx.account] === "number" ? String(account[ctx.account]).trim() : "";
  if (!number) throw fault(PAYME_ERRORS.orderNotFound, ctx.account);
  const order = await ctx.store.findOrder(number);
  if (!order) throw fault(PAYME_ERRORS.orderNotFound, ctx.account);
  if (order.status === "cancelled" || order.paymentStatus === "paid" || order.paymentStatus === "refunded") {
    throw fault(PAYME_ERRORS.orderClosed, ctx.account);
  }
  if (amount !== order.amount) throw fault(PAYME_ERRORS.amount);
  return order;
}

async function checkPerform(params: Params, ctx: PaymeContext) {
  const order = await payableOrder(params, ctx);
  const detail = ctx.detail ? await ctx.detail(order) : null;
  return detail ? { allow: true, detail } : { allow: true };
}

const expired = (tx: PaymeTx, now: number) => now - tx.createTime > PAYME_TIMEOUT_MS;

async function create(params: Params, ctx: PaymeContext) {
  const id = str(params, "id");
  const time = num(params, "time");
  const now = ctx.now();
  const existing = await ctx.store.findTx(id);
  if (existing) {
    if (existing.state !== 1) throw fault(PAYME_ERRORS.cannotPerform);
    if (expired(existing, now)) {
      await ctx.store.cancelTx(id, now, 4, -1);
      throw fault(PAYME_ERRORS.cannotPerform);
    }
    return { create_time: existing.createTime, transaction: existing.transaction, state: existing.state };
  }
  const order = await payableOrder(params, ctx);
  const pending = await ctx.store.pendingTxForOrder(order.number);
  if (pending) {
    // A transaction that timed out no longer holds the order.
    if (expired(pending, now)) await ctx.store.cancelTx(pending.id, now, 4, -1);
    else throw fault(PAYME_ERRORS.orderBusy, ctx.account);
  }
  const tx = await ctx.store.createTx({ id, orderNumber: order.number, amount: order.amount, createTime: now, providerTime: time });
  return { create_time: tx.createTime, transaction: tx.transaction, state: tx.state };
}

async function perform(params: Params, ctx: PaymeContext) {
  const id = str(params, "id");
  const now = ctx.now();
  const tx = await ctx.store.findTx(id);
  if (!tx) throw fault(PAYME_ERRORS.notFoundTx);
  if (tx.state === 2) return { transaction: tx.transaction, perform_time: tx.performTime, state: 2 };
  if (tx.state !== 1) throw fault(PAYME_ERRORS.cannotPerform);
  if (expired(tx, now)) {
    await ctx.store.cancelTx(id, now, 4, -1);
    throw fault(PAYME_ERRORS.cannotPerform);
  }
  // The shop cancelled the order while the customer was paying: the money is not taken.
  const order = await ctx.store.findOrder(tx.orderNumber);
  if (!order || order.status === "cancelled") {
    await ctx.store.cancelTx(id, now, 3, -1);
    throw fault(PAYME_ERRORS.cannotPerform);
  }
  const done = await ctx.store.performTx(id, now);
  return { transaction: done.transaction, perform_time: done.performTime, state: 2 };
}

async function cancel(params: Params, ctx: PaymeContext) {
  const id = str(params, "id");
  const reason = num(params, "reason");
  const now = ctx.now();
  const tx = await ctx.store.findTx(id);
  if (!tx) throw fault(PAYME_ERRORS.notFoundTx);
  if (tx.state === -1 || tx.state === -2) return { transaction: tx.transaction, cancel_time: tx.cancelTime, state: tx.state };
  if (tx.state === 1) {
    const done = await ctx.store.cancelTx(id, now, reason, -1);
    return { transaction: done.transaction, cancel_time: done.cancelTime, state: -1 };
  }
  // Paid: a refund is allowed until the goods have reached the customer.
  const order = await ctx.store.findOrder(tx.orderNumber);
  if (order?.status === "delivered") throw fault(PAYME_ERRORS.cannotCancel);
  const done = await ctx.store.cancelTx(id, now, reason, -2);
  return { transaction: done.transaction, cancel_time: done.cancelTime, state: -2 };
}

async function check(params: Params, ctx: PaymeContext) {
  const tx = await ctx.store.findTx(str(params, "id"));
  if (!tx) throw fault(PAYME_ERRORS.notFoundTx);
  return {
    create_time: tx.createTime,
    perform_time: tx.performTime ?? 0,
    cancel_time: tx.cancelTime ?? 0,
    transaction: tx.transaction,
    state: tx.state,
    reason: tx.reason,
  };
}

async function statement(params: Params, ctx: PaymeContext) {
  const from = num(params, "from");
  const to = num(params, "to");
  const rows = await ctx.store.statement(from, to);
  return {
    transactions: rows.map((tx) => ({
      id: tx.id,
      time: tx.providerTime,
      amount: tx.amount,
      account: { [ctx.account]: tx.orderNumber },
      create_time: tx.createTime,
      perform_time: tx.performTime ?? 0,
      cancel_time: tx.cancelTime ?? 0,
      transaction: tx.transaction,
      state: tx.state,
      reason: tx.reason,
    })),
  };
}

async function changePassword(params: Params, ctx: PaymeContext) {
  const password = str(params, "password");
  await ctx.store.changeKey(password);
  return { success: true };
}

/* ---------- checkout link ---------- */

export interface PaymeCheckout {
  merchantId: string;
  account: string;
  orderNumber: string;
  /** Tiyin. */
  amount: number;
  locale: "uz" | "ru";
  returnUrl: string;
  testMode: boolean;
}

/** GET https://checkout.paycom.uz/<base64 of m=…;ac.order_id=…;a=…;l=…;c=…> (test.paycom.uz in test mode). */
export function paymeCheckoutUrl(p: PaymeCheckout): string {
  const params = [`m=${p.merchantId}`, `ac.${p.account}=${p.orderNumber}`, `a=${p.amount}`, `l=${p.locale}`, `c=${p.returnUrl}`];
  const host = p.testMode ? "https://test.paycom.uz" : "https://checkout.paycom.uz";
  return `${host}/${Buffer.from(params.join(";")).toString("base64")}`;
}
