import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { readReleaseHours, restoreOrderStock } from "@/lib/catalog/stock";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { afterOrderStatus } from "@/lib/loyalty/order-status";
import { notifyCustomerOfOrder } from "@/lib/sms/transactional-server";
import { afterProductChange } from "@/lib/notify/waitlist";
import { revalidateFromWorker } from "@/lib/ops/revalidate";

/*
  Online orders nobody paid. An order takes tracked stock at once (it is
  the only way two customers cannot buy the last unit), so an online order
  abandoned at the gateway would hold its units for ever. After
  `orders.releaseUnpaidHours` (site_settings, standard 24, 0 = never) the
  worker cancels such an order — still `new`, unpaid, no payment in progress
  or done at Payme/Click — and the units come back, exactly as an operator's
  cancel would (stock once, points reversed, the customer told).

  Cash orders are never touched: the operator confirms those by phone.
*/

const BATCH = 20;

export async function releaseUnpaidOrders(): Promise<{ released: number }> {
  const hours = await readReleaseHours();
  if (hours <= 0) return { released: 0 };
  const db = getDb();
  // Conditional: an operator who confirmed the order a second ago wins.
  const rows = (await db.execute(sql`
    update orders o set status = 'cancelled', updated_at = now(),
      admin_note = concat_ws(E'\\n', nullif(o.admin_note, ''), ${`Avtomatik bekor qilindi: onlayn toʻlov ${hours} soat ichida kelmadi, mahsulot omborga qaytdi.`}::text)
    where o.id in (
      select id from orders
      where status = 'new' and payment_status in ('unpaid', 'pending')
        and payment ->> 'method' = 'online'
        and created_at < now() - (${hours}::int * interval '1 hour')
        and not exists (select 1 from payments p where p.order_number = orders.number and p.state in (1, 2))
      order by created_at
      limit ${BATCH}
      for update skip locked
    ) and o.status = 'new'
    returning o.id, o.number`)) as unknown as { id: number | string; number: string }[];

  let catalogChanged = false;
  for (const row of rows) {
    try {
      const changes = await restoreOrderStock(Number(row.id));
      if (changes.length > 0) catalogChanged = true;
      for (const c of changes) {
        if (c.before === 0 && c.after > 0) await afterProductChange(c.productId, { inStock: false, price: 0 }, { inStock: true, price: 0 });
      }
      const lines = await afterOrderStatus(row.number, "new", "cancelled");
      await notifyCustomerOfOrder(row.number, "cancelled", lines);
    } catch (err) {
      console.error(`[orders] release of ${row.number} incomplete:`, (err as Error).message);
    }
  }
  if (catalogChanged) await revalidateFromWorker({ tags: [CATALOG_TAG], paths: [["/", "layout"]] });
  if (rows.length) console.log(`[orders] ${rows.length} unpaid online order(s) cancelled after ${hours} h; stock returned`);
  return { released: rows.length };
}
