import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

/*
  Results of flows and campaigns, for /admin/flows and /admin/campaigns.

  sent       — messages that left (SMS accepted by the gateway, Telegram
               handed to the bot);
  delivered  — SMS accepted by the gateway, Telegram the bot reports as sent;
  clicked    — messages whose short link was opened (previews not counted);
  orders     — non-cancelled orders that used a code issued by this flow /
               campaign, or arrived with utm_campaign = its key (the click);
  revenue    — their totals. An order is counted once per key.
  Every key is "flow-<id>" or "campaign-<id>" (lib/messaging/outbox.ts).
*/

export interface MessageStats {
  sent: number;
  delivered: number;
  clicked: number;
  pending: number;
  failed: number;
  skipped: number;
  orders: number;
  revenue: number;
}

const EMPTY: MessageStats = { sent: 0, delivered: 0, clicked: 0, pending: 0, failed: 0, skipped: 0, orders: 0, revenue: 0 };
type Row = Record<string, string | number | null>;

export async function messageStats(keys: string[], sinceDays?: number): Promise<Map<string, MessageStats>> {
  const out = new Map<string, MessageStats>(keys.map((k) => [k, { ...EMPTY }]));
  if (keys.length === 0) return out;
  const list = sql.join(keys.map((k) => sql`${k}`), sql`, `);
  const since = sinceDays ? sql`now() - make_interval(days => ${sinceDays})` : sql`'-infinity'::timestamptz`;
  const db = getDb();
  const [messages, orders] = await Promise.all([
    db.execute(sql`
      select coalesce('flow-' || m.flow_id, 'campaign-' || m.campaign_id) as key,
             count(*) filter (where m.status = 'sent') as sent,
             count(*) filter (where m.status = 'sent' and (m.channel = 'sms' or b.status = 'sent')) as delivered,
             count(*) filter (where m.clicked_at is not null) as clicked,
             count(*) filter (where m.status in ('pending', 'sending')) as pending,
             count(*) filter (where m.status = 'failed') as failed,
             count(*) filter (where m.status = 'skipped') as skipped
      from outbound_messages m
      left join bot_jobs b on b.id = m.bot_job_id
      where coalesce('flow-' || m.flow_id, 'campaign-' || m.campaign_id) in (${list}) and m.created_at >= ${since}
      group by 1`),
    db.execute(sql`
      select k.key, count(distinct o.id) as orders, coalesce(sum(o.total), 0) as revenue
      from (select unnest(array[${list}]::text[]) as key) k
      join orders o on o.status <> 'cancelled' and o.created_at >= ${since}
        and (o.attribution->>'utmCampaign' = k.key
             or o.promo_code in (select p.code from promo_codes p where p.campaign_id = k.key))
      group by k.key`),
  ]);
  for (const r of messages as unknown as Row[]) {
    const s = out.get(String(r.key));
    if (!s) continue;
    Object.assign(s, { sent: Number(r.sent), delivered: Number(r.delivered), clicked: Number(r.clicked), pending: Number(r.pending), failed: Number(r.failed), skipped: Number(r.skipped) });
  }
  for (const r of orders as unknown as Row[]) {
    const s = out.get(String(r.key));
    if (s) Object.assign(s, { orders: Number(r.orders), revenue: Number(r.revenue) });
  }
  return out;
}

export interface FlowEnrollmentStats {
  activeNow: number;
  enrolled30: number;
  converted30: number;
  convertedRevenue30: number;
}

export async function flowEnrollmentStats(): Promise<Map<string, FlowEnrollmentStats>> {
  const rows = (await getDb().execute(sql`
    select e.flow_id,
           count(*) filter (where e.status = 'active') as active_now,
           count(*) filter (where e.enrolled_at > now() - interval '30 days') as enrolled30,
           count(*) filter (where e.status = 'converted' and e.finished_at > now() - interval '30 days') as converted30,
           coalesce(sum(o.total) filter (where e.status = 'converted' and e.finished_at > now() - interval '30 days' and o.status <> 'cancelled'), 0) as revenue30
    from flow_enrollments e
    left join orders o on o.id = e.converted_order_id
    group by e.flow_id`)) as unknown as Row[];
  return new Map(rows.map((r) => [String(r.flow_id), {
    activeNow: Number(r.active_now),
    enrolled30: Number(r.enrolled30),
    converted30: Number(r.converted30),
    convertedRevenue30: Number(r.revenue30),
  }]));
}

export function conversion(orders: number, sent: number): string {
  if (sent === 0) return "—";
  return `${((orders / sent) * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
}
