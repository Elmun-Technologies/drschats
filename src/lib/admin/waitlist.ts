import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products, restockRequests, type WaitKind, type WaitStatus } from "@/lib/db/schema";

/* Reads for /admin/waitlist. Writes live in lib/notify/waitlist.ts. */

export async function waitlistCounts() {
  const [row] = (await getDb().execute(sql`
    select count(*) filter (where status = 'waiting' and kind = 'restock') as restock,
           count(*) filter (where status = 'waiting' and kind = 'price_drop') as price_drop,
           count(*) filter (where status = 'notified' and notified_at >= now() - interval '30 days') as notified30,
           count(*) filter (where status = 'notified' and notified_via = 'telegram' and notified_at >= now() - interval '30 days') as telegram30
    from restock_requests`)) as unknown as Record<string, string | number>[];
  return {
    restock: Number(row?.restock ?? 0),
    priceDrop: Number(row?.price_drop ?? 0),
    notified30: Number(row?.notified30 ?? 0),
    telegram30: Number(row?.telegram30 ?? 0),
  };
}

/** Products someone is waiting on, most-awaited first. */
export async function waitlistByProduct() {
  const rows = (await getDb().execute(sql`
    select p.id, p.slug, p.content->'name'->>'uz' as name, p.in_stock, p.price, p.stock_qty, p.kind,
           count(*) filter (where r.kind = 'restock') as restock,
           count(*) filter (where r.kind = 'price_drop') as price_drop,
           count(*) filter (where r.kind = 'price_drop' and r.target_price > p.price) as price_due,
           max(r.created_at) as last_at
    from restock_requests r join products p on p.id = r.product_id
    where r.status = 'waiting'
    group by p.id
    order by count(*) desc, max(r.created_at) desc`)) as unknown as {
    id: string;
    slug: string;
    name: string | null;
    in_stock: boolean;
    price: number;
    stock_qty: number | null;
    kind: string;
    restock: string | number;
    price_drop: string | number;
    price_due: string | number;
    last_at: string | Date;
  }[];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name || r.slug,
    inStock: r.in_stock,
    price: Number(r.price),
    stockQty: r.stock_qty == null ? null : Number(r.stock_qty),
    unlisted: r.kind === "unlisted",
    restock: Number(r.restock),
    priceDrop: Number(r.price_drop),
    priceDue: Number(r.price_due),
    lastAt: new Date(r.last_at),
  }));
}

export async function listWaitRequests({ status, kind, limit = 300 }: { status?: WaitStatus; kind?: WaitKind; limit?: number }) {
  return getDb()
    .select({
      r: restockRequests,
      name: sql<string | null>`${products.content}->'name'->>'uz'`,
      price: products.price,
    })
    .from(restockRequests)
    .leftJoin(products, eq(products.id, restockRequests.productId))
    .where(and(status ? eq(restockRequests.status, status) : undefined, kind ? eq(restockRequests.kind, kind) : undefined))
    .orderBy(desc(restockRequests.createdAt))
    .limit(limit);
}

/** For the nav badge: requests still waiting. */
export async function waitingCount(): Promise<number> {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(restockRequests)
    .where(eq(restockRequests.status, "waiting"));
  return row?.n ?? 0;
}
