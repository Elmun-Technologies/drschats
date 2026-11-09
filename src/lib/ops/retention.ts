import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

/*
  How long the shop keeps what it collects. Run hourly by the worker, in
  small batches (a long DELETE would hold locks the storefront needs), so it
  used to be a 1-in-500 chance inside a visitor's own request.

  Orders, the loyalty ledger, promo redemptions and the admin audit log are
  records, not tracking data: they are kept (the customer's personal data in
  them can be erased on request — lib/admin/anonymise.ts).
*/

export const RETENTION: { table: string; where: SQL; label: string }[] = [
  { table: "visitor_events", label: "raw site events, 400 days", where: sql`created_at < now() - interval '400 days'` },
  // An anonymous visitor not seen for 13 months; one tied to a phone stays with the customer's record.
  { table: "visitors", label: "anonymous visitors, 400 days", where: sql`last_seen_at < now() - interval '400 days' and phone9 is null and orders_count = 0` },
  { table: "outbound_messages", label: "sent/failed messages, 365 days", where: sql`created_at < now() - interval '365 days' and status in ('sent', 'failed', 'skipped')` },
  { table: "bot_jobs", label: "delivered bot jobs, 90 days", where: sql`created_at < now() - interval '90 days' and status in ('sent', 'failed', 'blocked')` },
  { table: "banner_exposures", label: "banner A/B exposures, 180 days", where: sql`created_at < now() - interval '180 days'` },
  { table: "stock_movements", label: "stock movements, 2 years", where: sql`created_at < now() - interval '730 days'` },
  { table: "loyalty_otps", label: "SMS codes, 7 days", where: sql`created_at < now() - interval '7 days'` },
  { table: "telegram_logins", label: "website sign-in requests, 7 days", where: sql`created_at < now() - interval '7 days'` },
  { table: "rate_limit_hits", label: "expired rate-limit counters", where: sql`reset_at < now() - interval '1 hour'` },
  { table: "csp_reports", label: "CSP report counts, 90 days", where: sql`day < (now() - interval '90 days')::date` },
];

const BATCH = 5000;
const MAX_BATCHES = 20;

export async function runRetention(): Promise<Record<string, number>> {
  const db = getDb();
  const removed: Record<string, number> = {};
  for (const rule of RETENTION) {
    let total = 0;
    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        const rows = (await db.execute(sql`
          delete from ${sql.identifier(rule.table)} where ctid in (
            select ctid from ${sql.identifier(rule.table)} where ${rule.where} limit ${BATCH}
          ) returning 1`)) as unknown as unknown[];
        total += rows.length;
        if (rows.length < BATCH) break;
      }
    } catch (err) {
      console.error(`[retention] ${rule.table} skipped:`, (err as Error).message);
    }
    if (total) removed[rule.table] = total;
  }
  if (Object.keys(removed).length) console.log(`[retention] removed ${Object.entries(removed).map(([t, n]) => `${t} ${n}`).join(", ")}`);
  return removed;
}
