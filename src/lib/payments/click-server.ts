import "server-only";

import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { readOnlineProviders } from "./availability";
import { CLICK_ERRORS, clickComplete, clickPrepare, parseClickForm, type ClickContext, type ClickPayment, type ClickResponse } from "./click";
import { AlreadyPaid, cancelPayment, completePayment, findPayableOrder, findPayment, findPaymentById, insertPayment, type PaymentRow } from "./store";

const toClick = (row: PaymentRow): ClickPayment => ({ id: row.id, clickTransId: row.providerTxId, orderNumber: row.orderNumber, state: row.state });

const store: ClickContext["store"] = {
  async findOrder(number) {
    const order = await findPayableOrder(number);
    return order ? { number: order.number, total: order.total, status: order.status, paymentStatus: order.paymentStatus } : null;
  },
  async findByClickId(id) {
    const row = await findPayment("click", id);
    return row ? toClick(row) : null;
  },
  async findById(id) {
    const row = await findPaymentById(id);
    return row && row.provider === "click" ? toClick(row) : null;
  },
  async prepare(p) {
    return toClick(await insertPayment({ provider: "click", providerTxId: p.clickTransId, orderNumber: p.orderNumber, amount: p.amount, createTime: Date.now(), raw: p.raw }));
  },
  async complete(id) {
    try {
      return toClick(await completePayment(id, Date.now()));
    } catch (err) {
      if (err instanceof AlreadyPaid) return "already_paid";
      throw err;
    }
  },
  async cancel(id) {
    await cancelPayment(id, Date.now(), null, -1);
  },
};

/** /api/payments/click/{prepare,complete}: form body in, JSON out, settings read fresh. */
export async function clickEndpoint(step: "prepare" | "complete", body: string): Promise<ClickResponse> {
  const request = parseClickForm(new URLSearchParams(body));
  if (!request) return CLICK_ERRORS.request;
  if (!(await readOnlineProviders()).includes("click")) return { ...CLICK_ERRORS.sign, click_trans_id: request.click_trans_id, merchant_trans_id: request.merchant_trans_id };
  const { click } = await getRuntimeIntegrationSettings();
  const ctx: ClickContext = { serviceId: click.serviceId, secretKey: click.secretKey, store };
  try {
    return step === "prepare" ? await clickPrepare(request, ctx) : await clickComplete(request, ctx);
  } catch (err) {
    console.error(`[click] ${step} failed:`, (err as Error).message);
    return { ...CLICK_ERRORS.update, click_trans_id: request.click_trans_id, merchant_trans_id: request.merchant_trans_id };
  }
}
