import { desc, gte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, type OrderStatus } from "@/lib/db/schema";
import type { OrderAttribution, OrderRequest } from "@/lib/shopflow/types";

export const REPORT_RANGES = [1, 7, 30, 90] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

type AnalyticsOrder = {
  number: string | null;
  status: OrderStatus;
  total: number;
  customer: OrderRequest["customer"];
  items: OrderRequest["items"];
  attribution: OrderAttribution | null;
  createdAt: Date;
};

export type DailyMetric = { date: string; label: string; orders: number; revenue: number };
export type ProductMetric = { slug: string; name: string; quantity: number; revenue: number };
export type SourceMetric = { name: string; orders: number; revenue: number };
export type StatusCounts = Record<OrderStatus, number>;

export interface PeriodMetrics {
  orderCount: number;
  revenue: number;
  averageOrder: number;
  customerCount: number;
  deliveredCount: number;
  deliveredRevenue: number;
  cancelledCount: number;
  statusCounts: StatusCounts;
  daily: DailyMetric[];
  topProducts: ProductMetric[];
  sources: SourceMetric[];
  recentOrders: AnalyticsOrder[];
  pipelineOrders: AnalyticsOrder[];
}

export interface OrderMetrics {
  range: ReportRange;
  current: PeriodMetrics;
  previous: PeriodMetrics;
  generatedAt: Date;
}

function tashkentDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function startOfTashkentDay(date: Date): Date {
  return new Date(`${tashkentDateKey(date)}T00:00:00+05:00`);
}

function dayLabel(dateKey: string): string {
  const [, monthText, dayText] = dateKey.split("-");
  const month = Number(monthText);
  const months = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
  return `${Number(dayText)} ${months[month - 1] ?? ""}`;
}

function identityOf(customer: OrderRequest["customer"]): string | null {
  const phone = (customer.phone ?? "").replace(/\D/g, "");
  if (phone.length >= 9) return phone.slice(-9);
  const email = customer.email?.trim().toLowerCase();
  return email || null;
}

function displaySource(attribution: OrderAttribution | null): string {
  if (!attribution) return "Bevosita";
  const raw = attribution.utmSource?.trim();
  if (raw) {
    const value = raw.toLowerCase();
    if (["google", "googleads", "adwords"].some((part) => value.includes(part))) return "Google";
    if (["yandex", "ya.ru", "direct.yandex"].some((part) => value.includes(part))) return "Yandex";
    if (value.includes("instagram")) return "Instagram";
    if (["facebook", "meta", "fb"].some((part) => value.includes(part))) return "Meta";
    if (value.includes("telegram") || value === "t.me") return "Telegram";
    if (value.includes("email") || value.includes("newsletter")) return "Email";
    return raw.slice(0, 40);
  }
  const click = attribution.clickId?.split(":", 1)[0]?.toLowerCase();
  if (click === "gclid") return "Google";
  if (click === "yclid") return "Yandex";
  if (click === "fbclid") return "Meta";
  if (attribution.referrer) {
    const host = attribution.referrer.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("yandex")) return "Yandex";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("facebook")) return "Meta";
    if (host.includes("t.me") || host.includes("telegram")) return "Telegram";
    return host.slice(0, 40);
  }
  return "Bevosita";
}

function zeroStatusCounts(): StatusCounts {
  return { new: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
}

function summarize(rows: AnalyticsOrder[], rangeEnd: Date, rangeDays: number): PeriodMetrics {
  const statuses = zeroStatusCounts();
  const customers = new Set<string>();
  const dailyMap = new Map<string, DailyMetric>();
  const productsMap = new Map<string, ProductMetric>();
  const sourcesMap = new Map<string, SourceMetric>();

  // Fill empty dates too, ending today in Tashkent so the chart never hides today's orders.
  for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(rangeEnd.getTime() - offset * 24 * 60 * 60 * 1000);
    const key = tashkentDateKey(date);
    dailyMap.set(key, { date: key, label: dayLabel(key), orders: 0, revenue: 0 });
  }

  let revenue = 0;
  let deliveredRevenue = 0;
  for (const order of rows) {
    statuses[order.status] += 1;
    const identity = identityOf(order.customer);
    if (identity) customers.add(identity);

    const key = tashkentDateKey(order.createdAt);
    const day = dailyMap.get(key);
    if (day) {
      day.orders += 1;
      if (order.status !== "cancelled") day.revenue += order.total;
    }
    if (order.status !== "cancelled") revenue += order.total;
    if (order.status === "delivered") deliveredRevenue += order.total;

    const sourceName = displaySource(order.attribution);
    const source = sourcesMap.get(sourceName) ?? { name: sourceName, orders: 0, revenue: 0 };
    source.orders += 1;
    if (order.status !== "cancelled") source.revenue += order.total;
    sourcesMap.set(sourceName, source);

    if (order.status !== "cancelled") {
      for (const item of order.items ?? []) {
        const row = productsMap.get(item.slug) ?? { slug: item.slug, name: item.name, quantity: 0, revenue: 0 };
        row.quantity += item.quantity;
        row.revenue += item.unitPrice * item.quantity;
        productsMap.set(item.slug, row);
      }
    }
  }

  const orderCount = rows.length;
  return {
    orderCount,
    revenue,
    averageOrder: orderCount > statuses.cancelled ? Math.round(revenue / (orderCount - statuses.cancelled)) : 0,
    customerCount: customers.size,
    deliveredCount: statuses.delivered,
    deliveredRevenue,
    cancelledCount: statuses.cancelled,
    statusCounts: statuses,
    daily: [...dailyMap.values()],
    topProducts: [...productsMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    sources: [...sourcesMap.values()].sort((a, b) => b.orders - a.orders).slice(0, 6),
    recentOrders: [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8),
    pipelineOrders: [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100),
  };
}

/**
 * Order-based reporting from records already stored in Postgres. It intentionally
 * does not invent website sessions or pre-checkout conversions; those belong to
 * a connected analytics provider until a first-party event collector is added.
 */
export async function getOrderMetrics(days: ReportRange = 30): Promise<OrderMetrics> {
  const now = new Date();
  const dayStart = startOfTashkentDay(now);
  const oneDay = 24 * 60 * 60 * 1000;
  const currentFrom = new Date(dayStart.getTime() - (days - 1) * oneDay);
  const previousFrom = new Date(currentFrom.getTime() - days * oneDay);

  const rows = await getDb()
    .select({
      number: orders.number,
      status: orders.status,
      total: orders.total,
      customer: orders.customer,
      items: orders.items,
      attribution: orders.attribution,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(gte(orders.createdAt, previousFrom))
    .orderBy(desc(orders.createdAt));

  const currentRows = rows.filter((row) => row.createdAt >= currentFrom) as AnalyticsOrder[];
  const previousRows = rows.filter((row) => row.createdAt < currentFrom) as AnalyticsOrder[];
  return {
    range: days,
    current: summarize(currentRows, now, days),
    previous: summarize(previousRows, currentFrom, days),
    generatedAt: now,
  };
}

/** Current order status is the source of truth for each fulfillment stage. */
export function funnelStages(counts: StatusCounts) {
  const placed = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return [
    { key: "new" as const, label: "Yangi buyurtma", value: placed },
    { key: "confirmed" as const, label: "Tasdiqlandi", value: counts.confirmed + counts.shipped + counts.delivered },
    { key: "shipped" as const, label: "Joʻnatildi", value: counts.shipped + counts.delivered },
    { key: "delivered" as const, label: "Yetkazildi", value: counts.delivered },
  ].map((stage, index, all) => ({
    ...stage,
    rate: index === 0 || all[index - 1].value === 0 ? null : Math.round((stage.value / all[index - 1].value) * 100),
    share: placed === 0 ? 0 : Math.round((stage.value / placed) * 100),
  }));
}
