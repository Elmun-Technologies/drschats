import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { OrderStatus } from "@/lib/db/schema";
import { syncOrderStock } from "@/lib/catalog/order-stock";
import { afterOrderStatus } from "@/lib/loyalty/order-status";
import { notifyCustomerOfOrder } from "@/lib/sms/transactional-server";
import { notifyOperator } from "@/lib/notifications/operator";
import { selfCancelVerdict, type SelfCancelOutcome } from "./cancel-rules";

/*
  «Buyurtmani bekor qilish» on the signed tracking page. Allowed while the
  order is still being prepared (new / confirmed) and nothing was paid online:
  a paid order is refunded through the gateway, which only the operator can
  do, so the customer is sent to them instead.

  The order row is locked for the check and the update (the payment callbacks
  lock the same row), then everything an admin cancellation does follows:
  stock back once, points and referral unwound (afterOrderStatus), the
  customer's status message, and a line to the operator.
*/

export async function cancelByCustomer(orderNumber: string): Promise<SelfCancelOutcome> {
  const outcome = await getDb().transaction(async (tx) => {
    const [row] = (await tx.execute(sql`
      select status, payment_status from orders where number = ${orderNumber} for update`)) as unknown as { status: OrderStatus; payment_status: string }[];
    if (!row) return { result: "not_found" as const };
    const verdict = selfCancelVerdict(row.status, row.payment_status);
    if (verdict !== "ok") return { result: verdict };
    await tx.execute(sql`
      update orders set status = 'cancelled', updated_at = now(),
        admin_note = concat_ws(E'\\n', nullif(admin_note, ''), 'Mijoz kuzatish sahifasida oʻzi bekor qildi')
      where number = ${orderNumber}`);
    return { result: "cancelled" as const, from: row.status };
  });
  if (outcome.result !== "cancelled") return outcome.result;

  await syncOrderStock(orderNumber, outcome.from, "cancelled");
  const loyaltyLines = await afterOrderStatus(orderNumber, outcome.from, "cancelled");
  await notifyCustomerOfOrder(orderNumber, "cancelled", loyaltyLines).catch((err: Error) =>
    console.error(`[orders] ${orderNumber} cancel message failed:`, err.message),
  );
  await notifyOperator(`❌ Buyurtma #${orderNumber} — mijoz kuzatish sahifasida oʻzi bekor qildi`).catch(() => false);
  return "cancelled";
}
