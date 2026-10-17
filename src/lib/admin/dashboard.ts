import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { rangeWindow, type Range } from "./crm";

/*
  Series the dashboard draws. "Today" is bucketed by hour, every other range
  by day, and each series comes with the previous period of the same length
  on the same buckets, so the chart can lay last week under this week.
*/

type Row = Record<string, unknown>;

async function query(statement: SQL): Promise<Row[]> {
  return (await getDb().execute(statement)) as unknown as Row[];
}

const num = (value: unknown) => Number(value ?? 0);
const ts = (d: Date) => sql`${d.toISOString()}::timestamptz`;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

export interface SeriesPoint {
  key: string;
  label: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export interface TrafficSeries {
  unit: "hour" | "day";
  current: SeriesPoint[];
  previous: SeriesPoint[];
}

function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
}

function dayLabelOf(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`;
}

async function bucketed(from: Date, to: Date, unit: "hour" | "day"): Promise<SeriesPoint[]> {
  const fmt = unit === "hour" ? "HH24" : "YYYY-MM-DD";
  const [events, sales] = await Promise.all([
    query(sql`
      select to_char(created_at at time zone 'Asia/Tashkent', ${fmt}) as k,
             count(distinct visitor_id) filter (where session_id <> 'server') as visitors
      from visitor_events where created_at >= ${ts(from)} and created_at < ${ts(to)}
      group by 1`),
    query(sql`
      select to_char(created_at at time zone 'Asia/Tashkent', ${fmt}) as k,
             count(*) filter (where status <> 'cancelled') as orders,
             coalesce(sum(total) filter (where status <> 'cancelled'), 0) as revenue
      from orders where created_at >= ${ts(from)} and created_at < ${ts(to)}
      group by 1`),
  ]);
  const points = new Map<string, SeriesPoint>();
  if (unit === "hour") {
    for (let h = 0; h < 24; h += 1) {
      const key = String(h).padStart(2, "0");
      points.set(key, { key, label: `${key}:00`, visitors: 0, orders: 0, revenue: 0 });
    }
  } else {
    for (let t = from.getTime(); t < to.getTime(); t += DAY) {
      const key = dayKey(new Date(t + HOUR * 6));
      points.set(key, { key, label: dayLabelOf(key), visitors: 0, orders: 0, revenue: 0 });
    }
  }
  for (const row of events) {
    const point = points.get(String(row.k));
    if (point) point.visitors = num(row.visitors);
  }
  for (const row of sales) {
    const point = points.get(String(row.k));
    if (point) Object.assign(point, { orders: num(row.orders), revenue: num(row.revenue) });
  }
  return [...points.values()];
}

export async function trafficSeries(days: Range): Promise<TrafficSeries> {
  const { from, previousFrom } = rangeWindow(days);
  if (days === 1) {
    const end = new Date(from.getTime() + DAY);
    const [current, previous] = await Promise.all([bucketed(from, end, "hour"), bucketed(previousFrom, from, "hour")]);
    return { unit: "hour", current, previous };
  }
  const [current, previous] = await Promise.all([bucketed(from, new Date(from.getTime() + days * DAY), "day"), bucketed(previousFrom, from, "day")]);
  return { unit: "day", current, previous };
}

export interface Heatmap {
  days: number;
  visits: number[][];
  orders: number[][];
}

/** Weekday × hour (Tashkent, Monday first): when people come and when they buy. */
export async function activityHeatmap(range: Range): Promise<Heatmap> {
  const days = Math.max(range, 30);
  const from = new Date(Date.now() - days * DAY);
  const [visits, sales] = await Promise.all([
    query(sql`
      select extract(isodow from created_at at time zone 'Asia/Tashkent')::int as dow,
             extract(hour from created_at at time zone 'Asia/Tashkent')::int as h,
             count(distinct (visitor_id, session_id)) as n
      from visitor_events
      where created_at >= ${ts(from)} and session_id <> 'server'
      group by 1, 2`),
    query(sql`
      select extract(isodow from created_at at time zone 'Asia/Tashkent')::int as dow,
             extract(hour from created_at at time zone 'Asia/Tashkent')::int as h,
             count(*) as n
      from orders
      where created_at >= ${ts(from)} and status <> 'cancelled'
      group by 1, 2`),
  ]);
  const grid = () => Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const fill = (rows: Row[]) => {
    const out = grid();
    for (const row of rows) {
      const d = num(row.dow) - 1;
      const h = num(row.h);
      if (d >= 0 && d < 7 && h >= 0 && h < 24) out[d][h] = num(row.n);
    }
    return out;
  };
  return { days, visits: fill(visits), orders: fill(sales) };
}

export interface CustomerMix {
  newOrders: number;
  returningOrders: number;
  newRevenue: number;
  returningRevenue: number;
}

/** Orders in the period from first-time phones against phones that had ordered before. */
export async function customerMix(days: Range): Promise<CustomerMix> {
  const { from, to } = rangeWindow(days);
  const [row] = await query(sql`
    with o as (
      select id, total, created_at,
             right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 9) as phone9
      from orders where status <> 'cancelled'
    ),
    period as (
      select o.*, exists (select 1 from o earlier where earlier.phone9 = o.phone9 and earlier.created_at < o.created_at) as is_returning
      from o where o.created_at >= ${ts(from)} and o.created_at < ${ts(to)} and length(o.phone9) = 9
    )
    select count(*) filter (where not is_returning) as new_orders,
           count(*) filter (where is_returning) as returning_orders,
           coalesce(sum(total) filter (where not is_returning), 0) as new_revenue,
           coalesce(sum(total) filter (where is_returning), 0) as returning_revenue
    from period`);
  return {
    newOrders: num(row?.new_orders),
    returningOrders: num(row?.returning_orders),
    newRevenue: num(row?.new_revenue),
    returningRevenue: num(row?.returning_revenue),
  };
}

export interface CategorySales {
  slug: string;
  name: string;
  units: number;
  revenue: number;
}

export async function categorySales(days: Range): Promise<CategorySales[]> {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    select coalesce(p.category_slug, 'boshqa') as slug,
           coalesce(c.name->>'uz', 'Boshqa') as name,
           sum((item->>'quantity')::int) as units,
           sum((item->>'unitPrice')::numeric * (item->>'quantity')::int * (100 - coalesce((item->>'upsellDiscountPercent')::numeric, 0)) / 100) as revenue
    from orders o
    cross join jsonb_array_elements(o.items) as item
    left join products p on p.slug = item->>'slug'
    left join categories c on c.slug = p.category_slug
    where o.status <> 'cancelled' and o.created_at >= ${ts(from)} and o.created_at < ${ts(to)}
    group by 1, 2
    order by revenue desc
    limit 8`);
  return rows.map((row) => ({ slug: String(row.slug), name: String(row.name), units: num(row.units), revenue: Math.round(num(row.revenue)) }));
}

export interface TopProduct {
  slug: string;
  id: string | null;
  name: string;
  image: string | null;
  units: number;
  revenue: number;
}

export async function topProducts(days: Range, limit = 6): Promise<TopProduct[]> {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    select item->>'slug' as slug,
           max(item->>'name') as item_name,
           sum((item->>'quantity')::int) as units,
           sum((item->>'unitPrice')::numeric * (item->>'quantity')::int * (100 - coalesce((item->>'upsellDiscountPercent')::numeric, 0)) / 100) as revenue
    from orders o
    cross join jsonb_array_elements(o.items) as item
    where o.status <> 'cancelled' and o.created_at >= ${ts(from)} and o.created_at < ${ts(to)}
    group by 1
    order by revenue desc
    limit ${limit}`);
  if (rows.length === 0) return [];
  const slugs = rows.map((row) => String(row.slug));
  const pics = await query(sql`
    select slug, id, content->'name'->>'uz' as name, coalesce(cutout, images->>0) as image
    from products where slug in (${sql.join(slugs.map((s) => sql`${s}`), sql`, `)})`);
  const bySlug = new Map(pics.map((p) => [String(p.slug), p]));
  return rows.map((row) => {
    const p = bySlug.get(String(row.slug));
    return {
      slug: String(row.slug),
      id: p ? String(p.id) : null,
      name: String(p?.name ?? row.item_name ?? row.slug),
      image: p?.image ? String(p.image) : null,
      units: num(row.units),
      revenue: Math.round(num(row.revenue)),
    };
  });
}

export interface CustomerStats {
  customers: number;
  repeat: number;
  averageValue: number;
  averageGapDays: number | null;
  lapsed: number;
}

/** Whole-base numbers for the customers page, independent of its list limit. */
export async function customerStats(): Promise<CustomerStats> {
  const [row] = await query(sql`
    with o as (
      select right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 9) as phone9, total, created_at
      from orders
      where status <> 'cancelled' and length(regexp_replace(customer->>'phone', '[^0-9]', '', 'g')) >= 9
    ),
    c as (
      select phone9, count(*) as n, sum(total) as value, min(created_at) as first_at, max(created_at) as last_at
      from o group by phone9
    )
    select count(*) as customers,
           count(*) filter (where n >= 2) as repeat,
           coalesce(avg(value), 0) as average_value,
           avg(extract(epoch from (last_at - first_at)) / 86400 / (n - 1)) filter (where n >= 2) as gap,
           count(*) filter (where last_at < now() - interval '60 days') as lapsed
    from c`);
  return {
    customers: num(row?.customers),
    repeat: num(row?.repeat),
    averageValue: Math.round(num(row?.average_value)),
    averageGapDays: row?.gap == null ? null : Math.round(num(row.gap)),
    lapsed: num(row?.lapsed),
  };
}
