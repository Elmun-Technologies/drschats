import "server-only";

import { getRuntimeIntegrationSettings, saveIntegrationSettings } from "@/lib/integrations/settings";
import { isIntegrationEncryptionConfigured } from "@/lib/integrations/crypto";
import { readOnlineProviders } from "./availability";
import { orderFiscalDetail, type FiscalSettings } from "./fiscal-server";
import { PAYME_ERRORS, PaymeFault, handlePayme, type PaymeContext, type PaymeOrder, type PaymeResponse, type PaymeStore, type PaymeTx } from "./payme";
import {
  AlreadyPaid,
  OrderBusy,
  cancelPayment,
  completePayment,
  findPayableOrder,
  findPayment,
  insertPayment,
  paymentsBetween,
  pendingPaymentForOrder,
  type PaymentRow,
} from "./store";

function toTx(row: PaymentRow): PaymeTx {
  return {
    id: row.providerTxId,
    transaction: String(row.id),
    orderNumber: row.orderNumber,
    amount: row.amount,
    state: row.state,
    reason: row.reason,
    createTime: row.createTime,
    performTime: row.performTime,
    cancelTime: row.cancelTime,
    providerTime: row.providerTime ?? row.createTime,
  };
}

async function byPaymeId(id: string): Promise<PaymentRow> {
  const row = await findPayment("payme", id);
  if (!row) throw new PaymeFault(PAYME_ERRORS.notFoundTx);
  return row;
}

function paymeStore(account: string, testMode: boolean): PaymeStore {
  return {
    async findOrder(number) {
      const order = await findPayableOrder(number);
      return order ? { number: order.number, amount: order.total * 100, status: order.status, paymentStatus: order.paymentStatus } : null;
    },
    async findTx(id) {
      const row = await findPayment("payme", id);
      return row ? toTx(row) : null;
    },
    async pendingTxForOrder(number) {
      const row = await pendingPaymentForOrder("payme", number);
      return row ? toTx(row) : null;
    },
    async createTx(tx) {
      try {
        const row = await insertPayment(
          { provider: "payme", providerTxId: tx.id, orderNumber: tx.orderNumber, amount: tx.amount, createTime: tx.createTime, providerTime: tx.providerTime },
          { exclusive: true },
        );
        return toTx(row);
      } catch (err) {
        if (err instanceof OrderBusy) throw new PaymeFault({ ...PAYME_ERRORS.orderBusy, data: account });
        throw err;
      }
    },
    async performTx(id, time) {
      const row = await byPaymeId(id);
      try {
        return toTx(await completePayment(row.id, time));
      } catch (err) {
        if (err instanceof AlreadyPaid) {
          await cancelPayment(row.id, time, 5, -1);
          throw new PaymeFault(PAYME_ERRORS.cannotPerform);
        }
        throw err;
      }
    },
    async cancelTx(id, time, reason, state) {
      const row = await byPaymeId(id);
      return toTx(await cancelPayment(row.id, time, reason, state));
    },
    async statement(from, to) {
      return (await paymentsBetween("payme", from, to)).map(toTx);
    },
    async changeKey(password) {
      // Payme rotates the key from its cabinet and tells us the new one here.
      if (!isIntegrationEncryptionConfigured()) throw new PaymeFault(PAYME_ERRORS.system);
      await saveIntegrationSettings({ [testMode ? "payme.testKey" : "payme.key"]: password }, null);
    },
  };
}

/** The /api/payments/payme endpoint, settings read fresh on every call. */
export async function paymeEndpoint(rawBody: string, authHeader: string | null): Promise<PaymeResponse> {
  const settings = await getRuntimeIntegrationSettings();
  const { payme } = settings;
  const key = payme.testMode ? payme.testKey : payme.key;
  const ctx = context(payme.account, payme.testMode, key, settings.fiscal);
  // Switched off or not configured: every call is unauthorised, nothing about orders is revealed.
  const enabled = (await readOnlineProviders()).includes("payme");
  return handlePayme(rawBody, enabled ? authHeader : null, ctx);
}

function context(account: string, testMode: boolean, key: string, fiscal: FiscalSettings): PaymeContext {
  return {
    key,
    account,
    store: paymeStore(account, testMode),
    now: () => Date.now(),
    detail: (order) => orderFiscalDetail(order.number, fiscal),
  };
}
