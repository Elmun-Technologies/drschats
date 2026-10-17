import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { PromoSource } from "@/lib/db/schema";

/*
  Read side of /admin/promocodes: the list with its usage, and the page's
  own 30-day numbers. Revenue counts orders that used a code and were not
  cancelled.
*/

const ts = (d: Date) => sql`${d.toISOString()}::timestamptz`;

export const PROMO_FILTERS = {
  all: "Hammasi",
  active: "Faol",
  expired: "Tugagan / oʻchirilgan",
  personal: "Shaxsiy",
} as const;
export type PromoFilter = keyof typeof PROMO_FILTERS;

export function parsePromoFilter(raw: unknown): PromoFilter {
  return typeof raw === "string" && raw in PROMO_FILTERS ? (raw as PromoFilter) : "all";
}

export const SOURCE_LABEL: Record<PromoSource, string> = {
  manual: "Qoʻlda",
  campaign: "Kampaniya",
  flow: "Avtomatik xabar",
  referral: "Tavsiya",
  birthday: "Tugʻilgan kun",
  "first-order": "Birinchi buyurtma",
};

export interface PromoListRow {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  uses: number;
  perPhoneLimit: number;
  phone9: string | null;
  productCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  source: PromoSource;
  campaignId: string | null;
  note: string | null;
  createdAt: Date;
  orders: number;
  revenue: number;
  discount: number;
}

const date = (v: unknown) => (v ? new Date(v as string) : null);

export async function listPromoCodes({
  filter = "all",
  source,
  q,
  batch,
  limit = 300,
}: { filter?: PromoFilter; source?: PromoSource | null; q?: string; batch?: string | null; limit?: number } = {}): Promise<PromoListRow[]> {
  const now = ts(new Date());
  const where = [sql`true`];
  if (filter === "active") where.push(sql`p.active and (p.starts_at is null or p.starts_at <= ${now}) and (p.ends_at is null or p.ends_at > ${now}) and (p.max_uses is null or p.uses < p.max_uses)`);
  if (filter === "expired") where.push(sql`(not p.active or p.ends_at <= ${now} or (p.max_uses is not null and p.uses >= p.max_uses))`);
  if (filter === "personal") where.push(sql`p.phone9 is not null`);
  if (source) where.push(sql`p.source = ${source}`);
  if (batch) where.push(sql`p.campaign_id = ${batch}`);
  const term = q?.trim().toUpperCase();
  if (term) where.push(sql`(p.code like ${`%${term}%`} or p.campaign_id ilike ${`%${term}%`} or p.phone9 like ${`%${term.replace(/\D/g, "") || "~"}%`})`);

  const rows = (await getDb().execute(sql`
    select p.*,
           coalesce(jsonb_array_length(p.product_slugs), 0) as product_count,
           coalesce(u.orders, 0) as orders,
           coalesce(u.revenue, 0) as revenue,
           coalesce(u.discount, 0) as discount
    from promo_codes p
    left join lateral (
      select count(*) as orders, sum(o.total) as revenue, sum(r.discount) as discount
      from promo_redemptions r join orders o on o.id = r.order_id
      where r.code = p.code and o.status <> 'cancelled'
    ) u on true
    where ${sql.join(where, sql` and `)}
    order by p.created_at desc
    limit ${limit}
  `)) as unknown as Record<string, unknown>[];

  return rows.map((r) => ({
    code: String(r.code),
    kind: r.kind as "percent" | "fixed",
    value: Number(r.value),
    minSubtotal: r.min_subtotal == null ? null : Number(r.min_subtotal),
    maxUses: r.max_uses == null ? null : Number(r.max_uses),
    uses: Number(r.uses),
    perPhoneLimit: Number(r.per_phone_limit),
    phone9: (r.phone9 as string | null) ?? null,
    productCount: Number(r.product_count),
    startsAt: date(r.starts_at),
    endsAt: date(r.ends_at),
    active: Boolean(r.active),
    source: r.source as PromoSource,
    campaignId: (r.campaign_id as string | null) ?? null,
    note: (r.note as string | null) ?? null,
    createdAt: new Date(r.created_at as string),
    orders: Number(r.orders),
    revenue: Number(r.revenue),
    discount: Number(r.discount),
  }));
}

export interface PromoStats {
  orders: number;
  revenue: number;
  promoDiscount: number;
  firstOrderOrders: number;
  firstOrderDiscount: number;
  activeCodes: number;
}

/** The last `days` days: orders with a code, their revenue and discount; first-order discounts given. */
export async function promoStats(days = 30): Promise<PromoStats> {
  const since = ts(new Date(Date.now() - days * 86_400_000));
  const now = ts(new Date());
  const [row] = (await getDb().execute(sql`
    select
      (select count(*) from orders o where o.promo_code is not null and o.status <> 'cancelled' and o.created_at >= ${since}) as orders,
      (select coalesce(sum(o.total), 0) from orders o where o.promo_code is not null and o.status <> 'cancelled' and o.created_at >= ${since}) as revenue,
      (select coalesce(sum(r.discount), 0) from promo_redemptions r join orders o on o.id = r.order_id where o.status <> 'cancelled' and r.created_at >= ${since}) as promo_discount,
      (select count(*) from orders o where o.totals->'adjustments'->0->>'kind' = 'first_order' and o.status <> 'cancelled' and o.created_at >= ${since}) as first_orders,
      (select coalesce(sum((o.totals->'adjustments'->0->>'amount')::int), 0) from orders o where o.totals->'adjustments'->0->>'kind' = 'first_order' and o.status <> 'cancelled' and o.created_at >= ${since}) as first_discount,
      (select count(*) from promo_codes p where p.active and (p.ends_at is null or p.ends_at > ${now}) and (p.max_uses is null or p.uses < p.max_uses)) as active_codes
  `)) as unknown as Record<string, unknown>[];
  return {
    orders: Number(row?.orders ?? 0),
    revenue: Number(row?.revenue ?? 0),
    promoDiscount: Number(row?.promo_discount ?? 0),
    firstOrderOrders: Number(row?.first_orders ?? 0),
    firstOrderDiscount: Number(row?.first_discount ?? 0),
    activeCodes: Number(row?.active_codes ?? 0),
  };
}

export interface PromoRedemptionRow {
  orderNumber: string | null;
  phone9: string;
  discount: number;
  total: number;
  status: string;
  createdAt: Date;
}

export async function promoRedemptionsOf(code: string, limit = 100): Promise<PromoRedemptionRow[]> {
  const rows = (await getDb().execute(sql`
    select o.number, r.phone9, r.discount, o.total, o.status, r.created_at
    from promo_redemptions r join orders o on o.id = r.order_id
    where r.code = ${code}
    order by r.created_at desc
    limit ${limit}
  `)) as unknown as Record<string, unknown>[];
  return rows.map((r) => ({
    orderNumber: (r.number as string | null) ?? null,
    phone9: String(r.phone9),
    discount: Number(r.discount),
    total: Number(r.total),
    status: String(r.status),
    createdAt: new Date(r.created_at as string),
  }));
}

/** "−15%" or "−20 000 soʻm". */
export function promoValueLabel(kind: "percent" | "fixed", value: number): string {
  return kind === "percent" ? `−${value}%` : `−${value.toLocaleString("ru-RU").replace(/ /g, " ")} soʻm`;
}
