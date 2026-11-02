import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { lineTotal } from "@/lib/cart/pricing";

/*
  What the public tracking page may show about an order: status, the dates,
  what was ordered and what it costs. Never the name, phone or address — the
  link gets forwarded, and a courier's address is not the page's business.
*/
export interface TrackedOrder {
  number: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  method: "courier" | "pickup";
  items: { slug: string; name: string; quantity: number; total: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  /** "cod" or "online" — whether the customer still pays on receipt. */
  payment: string | null;
  /** The gateway chosen at checkout (payme / click), when online. */
  provider: string | null;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded";
  locale: string;
}

export const trackingAvailable = ORDERS_IN_DB;

type Row = {
  number: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
  delivery: { method?: string } | null;
  items: { slug: string; name: string; quantity: number; unitPrice: number; upsellDiscountPercent?: number }[];
  totals: { subtotal: number; discount: number; shipping: number; total: number };
  payment: { method?: string; provider?: string } | null;
  payment_status: TrackedOrder["paymentStatus"] | null;
  locale: string;
};

const iso = (v: string | Date) => (v instanceof Date ? v : new Date(v)).toISOString();

export async function trackedOrder(number: string): Promise<TrackedOrder | null> {
  if (!trackingAvailable) return null;
  const [o] = (await getDb().execute(sql`
    select number, status, created_at, updated_at, delivery, items, totals, payment, payment_status, locale
    from orders where number = ${number} limit 1`)) as unknown as Row[];
  if (!o) return null;
  return {
    number: o.number,
    status: o.status,
    createdAt: iso(o.created_at),
    updatedAt: iso(o.updated_at),
    method: o.delivery?.method === "pickup" ? "pickup" : "courier",
    items: (o.items ?? []).map((i) => ({
      slug: i.slug,
      name: i.name,
      quantity: i.quantity,
      total: lineTotal({ price: i.unitPrice, quantity: i.quantity, upsellDiscountPercent: i.upsellDiscountPercent }),
    })),
    subtotal: o.totals?.subtotal ?? 0,
    discount: o.totals?.discount ?? 0,
    shipping: o.totals?.shipping ?? 0,
    total: o.totals?.total ?? 0,
    payment: o.payment?.method ?? null,
    provider: o.payment?.provider ?? null,
    paymentStatus: o.payment_status ?? "unpaid",
    locale: o.locale,
  };
}

/** True when the order exists and was placed with this phone (last nine digits). */
export async function orderBelongsTo(number: string, phone9: string): Promise<boolean> {
  if (!trackingAvailable || !/^\d{9}$/.test(phone9)) return false;
  const rows = (await getDb().execute(sql`
    select 1 from orders
    where number = ${number} and right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) = ${phone9}
    limit 1`)) as unknown as unknown[];
  return rows.length > 0;
}
