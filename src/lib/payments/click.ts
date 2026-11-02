import { createHash, timingSafeEqual } from "node:crypto";

/*
  Click SHOP API — the protocol only (storage in click-server.ts).

  Click calls two URLs with application/x-www-form-urlencoded bodies:
    Prepare  (action=0): may this order be paid with this amount? → merchant_prepare_id
    Complete (action=1): the money was taken (error=0) or not (error<0)  → merchant_confirm_id
  Signatures (md5, hex):
    Prepare:  click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time
    Complete: click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time
  `amount` is concatenated exactly as Click sent it ("1000" or "1000.00").
  Docs: docs.click.uz → SHOP API; github.com/click-llc/click-integration-php.
*/

export const CLICK_ERRORS = {
  ok: { error: 0, error_note: "Success" },
  sign: { error: -1, error_note: "SIGN CHECK FAILED!" },
  amount: { error: -2, error_note: "Incorrect parameter amount" },
  action: { error: -3, error_note: "Action not found" },
  alreadyPaid: { error: -4, error_note: "Already paid" },
  order: { error: -5, error_note: "User does not exist" },
  transaction: { error: -6, error_note: "Transaction does not exist" },
  update: { error: -7, error_note: "Failed to update user" },
  request: { error: -8, error_note: "Error in request from click" },
  cancelled: { error: -9, error_note: "Transaction cancelled" },
} as const;

type ClickError = (typeof CLICK_ERRORS)[keyof typeof CLICK_ERRORS];

export interface ClickRequest {
  click_trans_id: string;
  service_id: string;
  click_paydoc_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  amount: string;
  action: string;
  error: string;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export interface ClickOrder {
  number: string;
  /** So'm. */
  total: number;
  status: string;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded";
}

export interface ClickPayment {
  id: number;
  clickTransId: string;
  orderNumber: string;
  state: 1 | 2 | -1 | -2;
}

export interface ClickStore {
  findOrder(number: string): Promise<ClickOrder | null>;
  findByClickId(clickTransId: string): Promise<ClickPayment | null>;
  findById(id: number): Promise<ClickPayment | null>;
  /** state 1 row; repeated Prepare for the same click_trans_id returns the same row. */
  prepare(p: { clickTransId: string; orderNumber: string; amount: number; raw: ClickRequest }): Promise<ClickPayment>;
  /** state 2 and the order paid; "already_paid" when another payment got there first. */
  complete(id: number): Promise<ClickPayment | "already_paid">;
  cancel(id: number): Promise<void>;
}

export interface ClickContext {
  serviceId: string;
  secretKey: string;
  store: ClickStore;
}

export type ClickResponse = ClickError & {
  click_trans_id?: string;
  merchant_trans_id?: string;
  merchant_prepare_id?: number;
  merchant_confirm_id?: number;
};

const FIELDS = ["click_trans_id", "service_id", "click_paydoc_id", "merchant_trans_id", "merchant_prepare_id", "amount", "action", "error", "error_note", "sign_time", "sign_string"] as const;

export function parseClickForm(form: URLSearchParams): ClickRequest | null {
  const get = (k: string) => form.get(k) ?? "";
  for (const k of ["click_trans_id", "service_id", "merchant_trans_id", "amount", "action", "sign_time", "sign_string"]) {
    if (!get(k)) return null;
  }
  const out: Record<string, string> = {};
  for (const k of FIELDS) out[k] = get(k);
  return out as unknown as ClickRequest;
}

export function clickSign(r: ClickRequest, secretKey: string): string {
  const prepareId = r.action === "1" ? (r.merchant_prepare_id ?? "") : "";
  return createHash("md5")
    .update(`${r.click_trans_id}${r.service_id}${secretKey}${r.merchant_trans_id}${prepareId}${r.amount}${r.action}${r.sign_time}`)
    .digest("hex");
}

function signOk(r: ClickRequest, secretKey: string): boolean {
  const expected = Buffer.from(clickSign(r, secretKey));
  const given = Buffer.from(r.sign_string.toLowerCase());
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Click sends so'm with up to two decimals; the order total is whole so'm. */
function amountMatches(amount: string, total: number): boolean {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return false;
  return Math.round(Number(amount) * 100) === total * 100;
}

const reply = (r: ClickRequest, e: ClickError, extra: Partial<ClickResponse> = {}): ClickResponse => ({
  click_trans_id: r.click_trans_id,
  merchant_trans_id: r.merchant_trans_id,
  ...extra,
  ...e,
});

async function common(r: ClickRequest, ctx: ClickContext, action: "0" | "1"): Promise<ClickResponse | ClickOrder> {
  if (!ctx.secretKey || !signOk(r, ctx.secretKey)) return reply(r, CLICK_ERRORS.sign);
  if (r.service_id !== ctx.serviceId) return reply(r, CLICK_ERRORS.request);
  if (r.action !== action) return reply(r, CLICK_ERRORS.action);
  const order = await ctx.store.findOrder(r.merchant_trans_id.trim());
  if (!order) return reply(r, CLICK_ERRORS.order);
  if (!amountMatches(r.amount, order.total)) return reply(r, CLICK_ERRORS.amount);
  return order;
}

export async function clickPrepare(r: ClickRequest, ctx: ClickContext): Promise<ClickResponse> {
  const checked = await common(r, ctx, "0");
  if ("error" in checked) return checked;
  const order = checked;
  const existing = await ctx.store.findByClickId(r.click_trans_id);
  if (existing?.state === 2 || order.paymentStatus === "paid") return reply(r, CLICK_ERRORS.alreadyPaid);
  if (existing && existing.state < 0) return reply(r, CLICK_ERRORS.cancelled);
  if (order.status === "cancelled" || order.paymentStatus === "refunded") return reply(r, CLICK_ERRORS.cancelled);
  const row = existing ?? (await ctx.store.prepare({ clickTransId: r.click_trans_id, orderNumber: order.number, amount: order.total * 100, raw: r }));
  return reply(r, CLICK_ERRORS.ok, { merchant_prepare_id: row.id });
}

export async function clickComplete(r: ClickRequest, ctx: ClickContext): Promise<ClickResponse> {
  const checked = await common(r, ctx, "1");
  if ("error" in checked) return checked;
  const order = checked;
  const row = await ctx.store.findById(Number(r.merchant_prepare_id));
  if (!row || row.clickTransId !== r.click_trans_id || row.orderNumber !== order.number) return reply(r, CLICK_ERRORS.transaction);
  if (row.state === 2) return reply(r, CLICK_ERRORS.alreadyPaid, { merchant_confirm_id: row.id });
  if (row.state < 0) return reply(r, CLICK_ERRORS.cancelled);
  // Click could not take the money (error < 0): the attempt is closed.
  if (Number(r.error) < 0) {
    await ctx.store.cancel(row.id);
    return reply(r, CLICK_ERRORS.cancelled);
  }
  if (order.status === "cancelled") {
    await ctx.store.cancel(row.id);
    return reply(r, CLICK_ERRORS.cancelled);
  }
  const done = await ctx.store.complete(row.id);
  if (done === "already_paid") {
    await ctx.store.cancel(row.id);
    return reply(r, CLICK_ERRORS.alreadyPaid);
  }
  return reply(r, CLICK_ERRORS.ok, { merchant_confirm_id: done.id });
}

/* ---------- payment link ---------- */

export interface ClickCheckout {
  serviceId: string;
  merchantId: string;
  orderNumber: string;
  /** So'm. */
  amount: number;
  returnUrl: string;
}

export function clickPayUrl(p: ClickCheckout): string {
  const q = new URLSearchParams({
    service_id: p.serviceId,
    merchant_id: p.merchantId,
    amount: p.amount.toFixed(2),
    transaction_param: p.orderNumber,
    return_url: p.returnUrl,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}
