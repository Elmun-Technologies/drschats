import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notifyWaitlist } from "@/lib/notify/waitlist";

/*
  A scheduled "Bugungi taklif" lowers the price the moment its window opens,
  but nothing in the catalogue write path notices a clock. This sweep is what
  turns a deal starting into "narxi tushsa xabar bering" customers hearing
  about it.

  Each deal is claimed exactly once in deal_notifications (0012), so two
  machines ticking at the same time — or a restarted process — cannot send the
  same price drop twice. Marking first and sending second is deliberate: a
  crash in between loses one round of texts, while the other order would send
  them forever.
*/

export interface DealSweepResult {
  started: number;
  notified: number;
}

export async function notifyStartedDeals(now = new Date()): Promise<DealSweepResult> {
  const db = getDb();
  let claimed: { deal_id: string; product_slug: string }[];
  try {
    claimed = (await db.execute(sql`
      insert into deal_notifications (deal_id)
      select d.id from deals d
      where d.starts_at <= ${now.toISOString()}::timestamptz
        and d.ends_at > ${now.toISOString()}::timestamptz
      on conflict (deal_id) do nothing
      returning deal_id`)) as unknown as { deal_id: string; product_slug: string }[];
  } catch (err) {
    // A database without 0012 (an old deploy) must not stop the worker.
    console.error("[deals] claim failed:", (err as Error).message);
    return { started: 0, notified: 0 };
  }
  if (claimed.length === 0) return { started: 0, notified: 0 };

  let notified = 0;
  for (const row of claimed) {
    try {
      const [deal] = (await db.execute(sql`
        select d.id, d.product_slug, p.id as product_id
        from deals d left join products p on p.slug = d.product_slug
        where d.id = ${Number(row.deal_id)}`)) as unknown as { product_slug: string; product_id: string | null }[];
      if (!deal?.product_id) continue;
      // sellingPrice() reads the deal that just started, so every waiting
      // target at or above it is due now.
      const sent = await notifyWaitlist(deal.product_id);
      notified += sent.due;
    } catch (err) {
      console.error("[deals] waitlist dispatch failed:", (err as Error).message);
    }
  }
  return { started: claimed.length, notified };
}
