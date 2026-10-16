import { and, desc, eq, ilike, max, min, sql, count, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminCustomerNotes, adminUsers, orders, type OrderStatus } from "@/lib/db/schema";
import type { OrderAttribution, OrderRequest } from "@/lib/shopflow/types";

const phoneTailSql = sql<string>`right(regexp_replace(${orders.customer}->>'phone', '[^0-9]', '', 'g'), 9)`;

export interface CustomerRow {
  phone9: string;
  name: string;
  phone: string;
  email: string | null;
  orderCount: number;
  successfulOrderCount: number;
  lifetimeValue: number;
  lastOrderAt: Date;
  lastStatus: OrderStatus;
}

export type CustomerLifecycle = "new" | "repeat" | "vip" | "dormant";

/** Lifecycle segment is derived from real orders, so it advances without a manual CRM edit. */
export function customerLifecycle(
  customer: Pick<CustomerRow, "successfulOrderCount" | "lifetimeValue" | "lastOrderAt">,
  now = Date.now(),
): CustomerLifecycle {
  const daysSinceOrder = Math.floor((now - customer.lastOrderAt.getTime()) / (24 * 60 * 60 * 1000));
  if (customer.successfulOrderCount > 0 && daysSinceOrder >= 60) return "dormant";
  if (customer.successfulOrderCount >= 3 || customer.lifetimeValue >= 1_000_000) return "vip";
  if (customer.successfulOrderCount >= 2) return "repeat";
  return "new";
}

export async function listCustomers(search?: string): Promise<CustomerRow[]> {
  const term = search?.trim().slice(0, 100);
  const nameExpr = sql<string>`${orders.customer}->>'name'`;
  const phoneExpr = sql<string>`${orders.customer}->>'phone'`;
  const emailExpr = sql<string>`${orders.customer}->>'email'`;
  const latest = (expression: ReturnType<typeof sql>) =>
    sql<string>`(array_agg(${expression} order by ${orders.createdAt} desc))[1]`;
  const latestStatus = sql<OrderStatus>`(array_agg(${orders.status} order by ${orders.createdAt} desc))[1]`;
  const lastOrderAt = max(orders.createdAt);
  const where = and(
    sql`length(regexp_replace(${orders.customer}->>'phone', '[^0-9]', '', 'g')) >= 9`,
    term ? or(ilike(nameExpr, `%${term}%`), ilike(phoneExpr, `%${term}%`), ilike(emailExpr, `%${term}%`)) : undefined,
  );

  const rows = await getDb()
    .select({
      phone9: phoneTailSql,
      name: latest(nameExpr),
      phone: latest(phoneExpr),
      email: latest(emailExpr),
      orderCount: count(),
      successfulOrderCount: sql<number>`count(*) filter (where ${orders.status} <> 'cancelled')`,
      lifetimeValue: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.total} else 0 end), 0)`,
      lastOrderAt,
      lastStatus: latestStatus,
    })
    .from(orders)
    .where(where)
    .groupBy(phoneTailSql)
    .orderBy(desc(lastOrderAt))
    .limit(250);

  return rows.map((row) => ({
    ...row,
    phone9: row.phone9 ?? "",
    name: row.name ?? "Mijoz",
    phone: row.phone ?? "",
    email: row.email || null,
    orderCount: Number(row.orderCount),
    successfulOrderCount: Number(row.successfulOrderCount),
    lifetimeValue: Number(row.lifetimeValue),
    lastOrderAt: row.lastOrderAt ?? new Date(0),
    lastStatus: row.lastStatus ?? "new",
  }));
}

export interface CustomerDetails {
  phone9: string;
  name: string;
  phone: string;
  email: string | null;
  orderCount: number;
  lifetimeValue: number;
  successfulOrderCount: number;
  firstOrderAt: Date;
  lastOrderAt: Date;
  orders: Array<{
    id: number;
    number: string | null;
    status: OrderStatus;
    total: number;
    customer: OrderRequest["customer"];
    delivery: OrderRequest["delivery"];
    items: OrderRequest["items"];
    attribution: OrderAttribution | null | undefined;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export async function getCustomerDetails(phone9: string): Promise<CustomerDetails | null> {
  if (!/^\d{9}$/.test(phone9)) return null;
  const db = getDb();
  const matches = sql`${phoneTailSql} = ${phone9}`;
  const [summary] = await db
    .select({
      latestName: sql<string>`(array_agg(${orders.customer}->>'name' order by ${orders.createdAt} desc))[1]`,
      latestPhone: sql<string>`(array_agg(${orders.customer}->>'phone' order by ${orders.createdAt} desc))[1]`,
      latestEmail: sql<string>`(array_agg(${orders.customer}->>'email' order by ${orders.createdAt} desc))[1]`,
      orderCount: count(),
      successfulOrderCount: sql<number>`count(*) filter (where ${orders.status} <> 'cancelled')`,
      lifetimeValue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)`,
      firstOrderAt: min(orders.createdAt),
      lastOrderAt: max(orders.createdAt),
    })
    .from(orders)
    .where(matches);
  if (!summary || Number(summary.orderCount) === 0) return null;

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      total: orders.total,
      customer: orders.customer,
      delivery: orders.delivery,
      items: orders.items,
      attribution: orders.attribution,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(matches)
    .orderBy(desc(orders.createdAt))
    .limit(200);
  const latest = rows[0];
  if (!latest || !summary.firstOrderAt || !summary.lastOrderAt) return null;
  return {
    phone9,
    name: summary.latestName ?? latest.customer.name,
    phone: summary.latestPhone ?? latest.customer.phone,
    email: summary.latestEmail || null,
    orderCount: Number(summary.orderCount),
    lifetimeValue: Number(summary.lifetimeValue),
    successfulOrderCount: Number(summary.successfulOrderCount),
    firstOrderAt: summary.firstOrderAt,
    lastOrderAt: summary.lastOrderAt,
    orders: rows,
  };
}

export async function listCustomerNotes(phone9: string) {
  if (!/^\d{9}$/.test(phone9)) return [];
  return getDb()
    .select({
      id: adminCustomerNotes.id,
      note: adminCustomerNotes.note,
      createdAt: adminCustomerNotes.createdAt,
      author: adminUsers.name,
    })
    .from(adminCustomerNotes)
    .leftJoin(adminUsers, eq(adminCustomerNotes.adminUserId, adminUsers.id))
    .where(eq(adminCustomerNotes.phone9, phone9))
    .orderBy(desc(adminCustomerNotes.createdAt))
    .limit(50);
}
