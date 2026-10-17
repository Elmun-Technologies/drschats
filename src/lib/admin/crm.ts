import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { CartSnapshotItem, OrderStatus, Touch, VisitorEventType, VisitorStage } from "@/lib/db/schema";
import { channelOf } from "@/lib/journey/model";
import type { OrderRequest } from "@/lib/shopflow/types";

/*
  Everything the CRM screens read. Visitor numbers come from the first-party
  journey (visitors, visitor_events); customer numbers from real orders. The
  two meet on the phone tail and on orders.visitor_id.
*/

type Row = Record<string, unknown>;

async function query<T = Row>(statement: SQL): Promise<T[]> {
  return (await getDb().execute(statement)) as unknown as T[];
}

const num = (value: unknown) => Number(value ?? 0);
const date = (value: unknown) => (value ? new Date(value as string) : null);

export const RANGES = [1, 7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export function parseRange(raw: unknown, fallback: Range = 30): Range {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return (RANGES as readonly number[]).includes(value) ? (value as Range) : fallback;
}

function tashkentDayStart(now: Date): Date {
  const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(`${key}T00:00:00+05:00`);
}

export function rangeWindow(days: Range, now = new Date()) {
  const day = 86_400_000;
  const from = new Date(tashkentDayStart(now).getTime() - (days - 1) * day);
  const previousFrom = new Date(from.getTime() - days * day);
  return { from, to: now, previousFrom };
}

/* ─── Site funnel ─────────────────────────────────────────────────────────── */

export interface FunnelCounts {
  visitors: number;
  sessions: number;
  pageViews: number;
  viewed: number;
  carted: number;
  checkout: number;
  purchased: number;
}

async function funnelBetween(from: Date, to: Date): Promise<FunnelCounts> {
  const [row] = await query(sql`
    select
      count(distinct visitor_id) filter (where session_id <> 'server') as visitors,
      count(distinct (visitor_id, session_id)) filter (where session_id <> 'server') as sessions,
      count(*) filter (where type = 'page_view') as page_views,
      count(distinct visitor_id) filter (where type in ('view_item', 'add_to_cart', 'begin_checkout', 'purchase')) as viewed,
      count(distinct visitor_id) filter (where type in ('add_to_cart', 'begin_checkout', 'purchase')) as carted,
      count(distinct visitor_id) filter (where type in ('begin_checkout', 'purchase')) as checkout,
      count(distinct visitor_id) filter (where type = 'purchase') as purchased
    from visitor_events
    where created_at >= ${from} and created_at < ${to}`);
  return {
    visitors: num(row?.visitors),
    sessions: num(row?.sessions),
    pageViews: num(row?.page_views),
    viewed: num(row?.viewed),
    carted: num(row?.carted),
    checkout: num(row?.checkout),
    purchased: num(row?.purchased),
  };
}

export async function siteFunnel(days: Range) {
  const { from, to, previousFrom } = rangeWindow(days);
  const [current, previous, newVisitors] = await Promise.all([
    funnelBetween(from, to),
    funnelBetween(previousFrom, from),
    query(sql`select count(*) as n from visitors where first_seen_at >= ${from}`),
  ]);
  return { current, previous, newVisitors: num(newVisitors[0]?.n) };
}

export const FUNNEL_STEPS: { key: keyof FunnelCounts; label: string; hint: string }[] = [
  { key: "visitors", label: "Saytga kirdi", hint: "Noyob tashrif buyuruvchilar" },
  { key: "viewed", label: "Mahsulot koʻrdi", hint: "Kamida bitta mahsulot sahifasi" },
  { key: "carted", label: "Savatga qoʻshdi", hint: "Kamida bitta mahsulot" },
  { key: "checkout", label: "Rasmiylashtirishni boshladi", hint: "Buyurtma formasini toʻldira boshladi" },
  { key: "purchased", label: "Sotib oldi", hint: "Buyurtma yubordi" },
];

export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

/* ─── Traffic ─────────────────────────────────────────────────────────────── */

export interface DailyTraffic {
  date: string;
  visitors: number;
  buyers: number;
  orders: number;
  revenue: number;
}

export async function dailyTraffic(days: Range): Promise<DailyTraffic[]> {
  const { from, to } = rangeWindow(days);
  const [events, sales] = await Promise.all([
    query(sql`
      select to_char(created_at at time zone 'Asia/Tashkent', 'YYYY-MM-DD') as d,
             count(distinct visitor_id) filter (where session_id <> 'server') as visitors,
             count(distinct visitor_id) filter (where type = 'purchase') as buyers
      from visitor_events where created_at >= ${from} and created_at < ${to}
      group by 1`),
    query(sql`
      select to_char(created_at at time zone 'Asia/Tashkent', 'YYYY-MM-DD') as d,
             count(*) as orders,
             coalesce(sum(total) filter (where status <> 'cancelled'), 0) as revenue
      from orders where created_at >= ${from} and created_at < ${to}
      group by 1`),
  ]);
  const byDay = new Map<string, DailyTraffic>();
  for (let t = from.getTime(); t < to.getTime(); t += 86_400_000) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date(t));
    byDay.set(key, { date: key, visitors: 0, buyers: 0, orders: 0, revenue: 0 });
  }
  for (const row of events) {
    const day = byDay.get(row.d as string);
    if (day) Object.assign(day, { visitors: num(row.visitors), buyers: num(row.buyers) });
  }
  for (const row of sales) {
    const day = byDay.get(row.d as string);
    if (day) Object.assign(day, { orders: num(row.orders), revenue: num(row.revenue) });
  }
  return [...byDay.values()];
}

export interface ChannelRow {
  channel: string;
  visitors: number;
  buyers: number;
  revenue: number;
}

/** Visitors active in the period, by the channel that first brought them. */
export async function channels(days: Range): Promise<ChannelRow[]> {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    with active as (
      select visitor_id,
             bool_or(type = 'purchase') as bought
      from visitor_events
      where created_at >= ${from} and created_at < ${to}
      group by visitor_id
    ),
    revenue as (
      select visitor_id, sum(total) as revenue
      from orders
      where visitor_id is not null and status <> 'cancelled' and created_at >= ${from} and created_at < ${to}
      group by visitor_id
    )
    select jsonb_strip_nulls(jsonb_build_object(
             'source', v.first_touch->>'source',
             'medium', v.first_touch->>'medium',
             'referrer', v.first_touch->>'referrer',
             'clickId', nullif(split_part(coalesce(v.first_touch->>'clickId', ''), ':', 1), '') || ':'
           )) as touch,
           count(*) as visitors,
           count(*) filter (where a.bought) as buyers,
           coalesce(sum(r.revenue), 0) as revenue
    from active a
    join visitors v on v.id = a.visitor_id
    left join revenue r on r.visitor_id = a.visitor_id
    group by 1
    limit 5000`);
  const merged = new Map<string, ChannelRow>();
  for (const row of rows) {
    const channel = channelOf(row.touch as Touch | null);
    const entry = merged.get(channel) ?? { channel, visitors: 0, buyers: 0, revenue: 0 };
    entry.visitors += num(row.visitors);
    entry.buyers += num(row.buyers);
    entry.revenue += num(row.revenue);
    merged.set(channel, entry);
  }
  return [...merged.values()].sort((a, b) => b.visitors - a.visitors);
}

export async function devices(days: Range) {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    select coalesce(v.device, 'desktop') as device, count(distinct v.id) as visitors
    from visitors v
    where exists (select 1 from visitor_events e where e.visitor_id = v.id and e.created_at >= ${from} and e.created_at < ${to})
    group by 1 order by 2 desc`);
  const label: Record<string, string> = { mobile: "Telefon", tablet: "Planshet", desktop: "Kompyuter" };
  return rows.map((row) => ({ device: label[row.device as string] ?? String(row.device), visitors: num(row.visitors) }));
}

export interface ProductInterest {
  slug: string;
  name: string;
  views: number;
  carts: number;
  orders: number;
}

/** What people look at against what they buy — a product seen a lot and bought rarely needs attention. */
export async function productInterest(days: Range, limit = 10): Promise<ProductInterest[]> {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    with ev as (
      select product_slug as slug,
             count(distinct visitor_id) filter (where type = 'view_item') as views,
             count(distinct visitor_id) filter (where type = 'add_to_cart') as carts
      from visitor_events
      where product_slug is not null and created_at >= ${from} and created_at < ${to}
      group by 1
    ),
    sold as (
      select item->>'slug' as slug, sum((item->>'quantity')::int) as orders
      from orders, jsonb_array_elements(items) as item
      where status <> 'cancelled' and created_at >= ${from} and created_at < ${to}
      group by 1
    )
    select coalesce(ev.slug, sold.slug) as slug,
           coalesce(p.content->'name'->>'uz', coalesce(ev.slug, sold.slug)) as name,
           coalesce(ev.views, 0) as views, coalesce(ev.carts, 0) as carts, coalesce(sold.orders, 0) as orders
    from ev full join sold on sold.slug = ev.slug
    left join products p on p.slug = coalesce(ev.slug, sold.slug)
    order by coalesce(ev.views, 0) desc, coalesce(sold.orders, 0) desc
    limit ${limit}`);
  return rows.map((row) => ({ slug: String(row.slug), name: String(row.name), views: num(row.views), carts: num(row.carts), orders: num(row.orders) }));
}

export async function topPages(days: Range, limit = 10) {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    select split_part(path, '?', 1) as path, count(*) as views, count(distinct visitor_id) as visitors
    from visitor_events
    where type = 'page_view' and path is not null and created_at >= ${from} and created_at < ${to}
    group by 1 order by 2 desc limit ${limit}`);
  return rows.map((row) => ({ path: String(row.path), views: num(row.views), visitors: num(row.visitors) }));
}

export async function topSearches(days: Range, limit = 10) {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    select lower(trim(meta->>'term')) as term, count(*) as n
    from visitor_events
    where type = 'search' and meta->>'term' is not null and created_at >= ${from} and created_at < ${to}
    group by 1 order by 2 desc limit ${limit}`);
  return rows.map((row) => ({ term: String(row.term), count: num(row.n) }));
}

/* ─── Visitors ────────────────────────────────────────────────────────────── */

export interface VisitorRow {
  id: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  sessions: number;
  pageViews: number;
  device: string | null;
  locale: string | null;
  stage: VisitorStage;
  channel: string;
  firstTouch: Touch | null;
  cartValue: number;
  cartItems: CartSnapshotItem[];
  cartAt: Date | null;
  phone9: string | null;
  name: string | null;
  ordersCount: number;
  lastOrderAt: Date | null;
}

function visitorOut(row: Row): VisitorRow {
  return {
    id: String(row.id),
    firstSeenAt: date(row.first_seen_at) ?? new Date(0),
    lastSeenAt: date(row.last_seen_at) ?? new Date(0),
    sessions: num(row.sessions),
    pageViews: num(row.page_views),
    device: (row.device as string) ?? null,
    locale: (row.locale as string) ?? null,
    stage: row.stage as VisitorStage,
    channel: channelOf(row.first_touch as Touch | null),
    firstTouch: (row.first_touch as Touch) ?? null,
    cartValue: num(row.cart_value),
    cartItems: (row.cart_items as CartSnapshotItem[]) ?? [],
    cartAt: date(row.cart_at),
    phone9: (row.phone9 as string) ?? null,
    name: (row.name as string) ?? null,
    ordersCount: num(row.orders_count),
    lastOrderAt: date(row.last_order_at),
  };
}

export const VISITOR_FILTERS = {
  all: { label: "Hammasi", where: sql`true` },
  abandoned: {
    label: "Savatni tashlab ketgan",
    where: sql`cart_value > 0 and cart_at < now() - interval '1 hour' and (last_order_at is null or last_order_at < cart_at)`,
  },
  checkout: { label: "Rasmiylashtirishda qolgan", where: sql`stage = 'checkout'` },
  product: { label: "Faqat koʻrgan", where: sql`stage = 'product'` },
  customers: { label: "Xaridorlar", where: sql`stage = 'customer'` },
  identified: { label: "Telefoni maʼlum", where: sql`phone9 is not null` },
  returning: { label: "Qaytib kelgan", where: sql`sessions > 1` },
} as const;
export type VisitorFilter = keyof typeof VISITOR_FILTERS;

export function parseVisitorFilter(raw: unknown): VisitorFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" && value in VISITOR_FILTERS ? (value as VisitorFilter) : "all";
}

export async function listVisitors({ filter, q, page = 1, pageSize = 50 }: { filter: VisitorFilter; q?: string; page?: number; pageSize?: number }) {
  const term = q?.trim().slice(0, 60);
  const digits = term?.replace(/\D/g, "") ?? "";
  const search = term
    ? sql`and (name ilike ${`%${term}%`}${digits.length >= 4 ? sql` or phone9 like ${`%${digits.slice(-9)}%`}` : sql``})`
    : sql``;
  const offset = (Math.max(1, page) - 1) * pageSize;
  const [rows, counts] = await Promise.all([
    query(sql`select * from visitors where ${VISITOR_FILTERS[filter].where} ${search} order by last_seen_at desc limit ${pageSize} offset ${offset}`),
    query(sql`
      select
        count(*) as all,
        count(*) filter (where ${VISITOR_FILTERS.abandoned.where}) as abandoned,
        count(*) filter (where ${VISITOR_FILTERS.checkout.where}) as checkout,
        count(*) filter (where ${VISITOR_FILTERS.product.where}) as product,
        count(*) filter (where ${VISITOR_FILTERS.customers.where}) as customers,
        count(*) filter (where ${VISITOR_FILTERS.identified.where}) as identified,
        count(*) filter (where ${VISITOR_FILTERS.returning.where}) as returning
      from visitors where true ${search}`),
  ]);
  const c = counts[0] ?? {};
  return {
    rows: rows.map(visitorOut),
    counts: Object.fromEntries(Object.keys(VISITOR_FILTERS).map((key) => [key, num(c[key])])) as Record<VisitorFilter, number>,
  };
}

export interface VisitorEvent {
  id: number;
  type: VisitorEventType;
  path: string | null;
  productSlug: string | null;
  productName: string | null;
  value: number | null;
  meta: Record<string, unknown> | null;
  sessionId: string;
  createdAt: Date;
}

export interface CustomerOrder {
  id: number;
  number: string | null;
  status: OrderStatus;
  total: number;
  items: OrderRequest["items"];
  createdAt: Date;
}

export async function getVisitor(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await query(sql`select * from visitors where id = ${id}::uuid`);
  if (!row) return null;
  const visitor = visitorOut(row);
  const [events, orderRows, siblings] = await Promise.all([
    query(sql`
      select e.*, p.content->'name'->>'uz' as product_name
      from visitor_events e left join products p on p.slug = e.product_slug
      where e.visitor_id = ${id}::uuid order by e.created_at desc limit 400`),
    query(sql`
      select id, number, status, total, items, created_at from orders
      where visitor_id = ${id}::uuid
         ${visitor.phone9 ? sql`or right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 9) = ${visitor.phone9}` : sql``}
      order by created_at desc limit 50`),
    visitor.phone9
      ? query(sql`select id, device, last_seen_at from visitors where phone9 = ${visitor.phone9} and id <> ${id}::uuid order by last_seen_at desc limit 10`)
      : Promise.resolve([] as Row[]),
  ]);
  return {
    visitor,
    events: events.map((e): VisitorEvent => ({
      id: num(e.id),
      type: e.type as VisitorEventType,
      path: (e.path as string) ?? null,
      productSlug: (e.product_slug as string) ?? null,
      productName: (e.product_name as string) ?? null,
      value: e.value == null ? null : num(e.value),
      meta: (e.meta as Record<string, unknown>) ?? null,
      sessionId: String(e.session_id),
      createdAt: date(e.created_at) ?? new Date(0),
    })),
    orders: orderRows.map((o): CustomerOrder => ({
      id: num(o.id),
      number: (o.number as string) ?? null,
      status: o.status as OrderStatus,
      total: num(o.total),
      items: o.items as OrderRequest["items"],
      createdAt: date(o.created_at) ?? new Date(0),
    })),
    otherDevices: siblings.map((s) => ({ id: String(s.id), device: (s.device as string) ?? null, lastSeenAt: date(s.last_seen_at) ?? new Date(0) })),
  };
}

/** Journey of every browser this phone number used — shown on the customer profile. */
export async function visitorsForPhone(phone9: string) {
  if (!/^\d{9}$/.test(phone9)) return [];
  const rows = await query(sql`select * from visitors where phone9 = ${phone9} order by last_seen_at desc limit 10`);
  return rows.map(visitorOut);
}

export async function recentEventsForPhone(phone9: string, limit = 60) {
  if (!/^\d{9}$/.test(phone9)) return [];
  const rows = await query(sql`
    select e.*, p.content->'name'->>'uz' as product_name
    from visitor_events e
    join visitors v on v.id = e.visitor_id
    left join products p on p.slug = e.product_slug
    where v.phone9 = ${phone9}
    order by e.created_at desc limit ${limit}`);
  return rows.map((e): VisitorEvent => ({
    id: num(e.id),
    type: e.type as VisitorEventType,
    path: (e.path as string) ?? null,
    productSlug: (e.product_slug as string) ?? null,
    productName: (e.product_name as string) ?? null,
    value: e.value == null ? null : num(e.value),
    meta: (e.meta as Record<string, unknown>) ?? null,
    sessionId: String(e.session_id),
    createdAt: date(e.created_at) ?? new Date(0),
  }));
}

export async function liveNow() {
  const [row] = await query(sql`
    select count(distinct visitor_id) as n from visitor_events
    where created_at > now() - interval '5 minutes' and session_id <> 'server'`);
  return num(row?.n);
}

/** Performance per UTM campaign: who came through each link and what they bought. */
export async function utmCampaigns(days: Range) {
  const { from, to } = rangeWindow(days);
  const rows = await query(sql`
    with active as (
      select visitor_id, bool_or(type = 'purchase') as bought
      from visitor_events where created_at >= ${from} and created_at < ${to}
      group by visitor_id
    ),
    revenue as (
      select visitor_id, sum(total) as revenue from orders
      where visitor_id is not null and status <> 'cancelled' and created_at >= ${from} and created_at < ${to}
      group by visitor_id
    )
    select coalesce(v.last_touch->>'campaign', v.first_touch->>'campaign') as campaign,
           coalesce(v.last_touch->>'source', v.first_touch->>'source') as source,
           count(*) as visitors,
           count(*) filter (where a.bought) as buyers,
           coalesce(sum(r.revenue), 0) as revenue
    from active a
    join visitors v on v.id = a.visitor_id
    left join revenue r on r.visitor_id = a.visitor_id
    where coalesce(v.last_touch->>'campaign', v.first_touch->>'campaign') is not null
    group by 1, 2
    order by 3 desc
    limit 50`);
  return rows.map((row) => ({ campaign: String(row.campaign), source: row.source ? String(row.source) : "—", visitors: num(row.visitors), buyers: num(row.buyers), revenue: num(row.revenue) }));
}
