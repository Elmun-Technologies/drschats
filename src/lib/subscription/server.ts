import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { OrderRequest } from "@/lib/shopflow/types";

/*
  "Obuna" lines become rows (0017): one active subscription per phone and
  product. Nothing is charged or shipped by itself — the row is what the
  operator works from (/admin/subscriptions: who is due, when) and what the
  opt-in «Obuna: keyingi yetkazish» flow reminds the customer from. A repeat
  order of the same product with «obuna» moves the next date on.
*/

const DAY_MS = 24 * 60 * 60 * 1000;

export async function recordSubscriptions(orderNumber: string, order: OrderRequest): Promise<number> {
  const lines = order.items.filter((i) => i.subscription?.intervalDays);
  const phone9 = order.customer.phone.replace(/\D/g, "").slice(-9);
  if (lines.length === 0 || phone9.length !== 9) return 0;
  const db = getDb();
  const [row] = (await db.execute(sql`select id, created_at from orders where number = ${orderNumber} limit 1`)) as unknown as {
    id: string | number;
    created_at: string | Date;
  }[];
  if (!row) return 0;
  const orderId = Number(row.id);
  const placed = new Date(row.created_at);
  for (const line of lines) {
    const days = line.subscription!.intervalDays;
    const due = new Date(placed.getTime() + days * DAY_MS).toISOString();
    await db.execute(sql`
      insert into subscriptions (phone9, product_slug, product_name, quantity, interval_days, locale, customer_name,
                                 first_order_id, last_order_id, last_order_number, next_due_at)
      values (${phone9}, ${line.slug}, ${line.name.slice(0, 200)}, ${line.quantity}, ${days}, ${order.locale},
              ${order.customer.name.slice(0, 120)}, ${orderId}, ${orderId}, ${orderNumber}, ${due}::timestamptz)
      on conflict (phone9, product_slug) where status = 'active' do update set
        quantity = excluded.quantity, interval_days = excluded.interval_days, locale = excluded.locale,
        customer_name = excluded.customer_name, product_name = excluded.product_name,
        last_order_id = excluded.last_order_id, last_order_number = excluded.last_order_number,
        next_due_at = excluded.next_due_at, updated_at = now()`);
  }
  return lines.length;
}

export interface SubscriptionRow {
  id: number;
  phone9: string;
  productSlug: string;
  productName: string;
  quantity: number;
  intervalDays: number;
  customerName: string | null;
  lastOrderNumber: string | null;
  lastOrderStatus: string | null;
  status: "active" | "cancelled";
  nextDueAt: Date;
  createdAt: Date;
}

/**
 * Subscriptions for the operator. A subscription whose last order was
 * cancelled is shown as such and never counted as due: nothing was delivered
 * to repeat.
 */
export async function listSubscriptions(filter: "due" | "active" | "cancelled" | "all", dueWithinDays = 3): Promise<SubscriptionRow[]> {
  const where =
    filter === "due"
      ? sql`s.status = 'active' and coalesce(o.status, '') <> 'cancelled' and s.next_due_at <= now() + make_interval(days => ${dueWithinDays})`
      : filter === "active"
        ? sql`s.status = 'active'`
        : filter === "cancelled"
          ? sql`s.status = 'cancelled'`
          : sql`true`;
  const rows = (await getDb().execute(sql`
    select s.id, s.phone9, s.product_slug, s.product_name, s.quantity, s.interval_days, s.customer_name,
           s.last_order_number, o.status as last_order_status, s.status, s.next_due_at, s.created_at
    from subscriptions s left join orders o on o.id = s.last_order_id
    where ${where}
    order by s.status, s.next_due_at
    limit 500`)) as unknown as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    phone9: String(r.phone9),
    productSlug: String(r.product_slug),
    productName: String(r.product_name),
    quantity: Number(r.quantity),
    intervalDays: Number(r.interval_days),
    customerName: (r.customer_name as string) ?? null,
    lastOrderNumber: (r.last_order_number as string) ?? null,
    lastOrderStatus: (r.last_order_status as string) ?? null,
    status: r.status === "cancelled" ? "cancelled" : "active",
    nextDueAt: new Date(r.next_due_at as string),
    createdAt: new Date(r.created_at as string),
  }));
}

export async function subscriptionCounts(): Promise<{ active: number; due: number }> {
  const [row] = (await getDb().execute(sql`
    select count(*) filter (where s.status = 'active') as active,
           count(*) filter (where s.status = 'active' and coalesce(o.status, '') <> 'cancelled' and s.next_due_at <= now() + interval '3 days') as due
    from subscriptions s left join orders o on o.id = s.last_order_id`)) as unknown as { active: string; due: string }[];
  return { active: Number(row?.active ?? 0), due: Number(row?.due ?? 0) };
}

/** The operator handled this delivery by hand: the next one is one interval later. */
export async function advanceSubscription(id: number): Promise<void> {
  await getDb().execute(sql`
    update subscriptions set next_due_at = greatest(next_due_at, now()) + make_interval(days => interval_days), updated_at = now()
    where id = ${id} and status = 'active'`);
}

export async function cancelSubscription(id: number): Promise<void> {
  await getDb().execute(sql`update subscriptions set status = 'cancelled', updated_at = now() where id = ${id} and status = 'active'`);
}
