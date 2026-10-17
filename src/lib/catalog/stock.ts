import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, products, siteSettings, stockMovements } from "@/lib/db/schema";
import {
  DEFAULT_LOW_STOCK_AT,
  LOW_STOCK_SETTING_KEY,
  adjustedQty,
  cancelRestores,
  parseLowStockAt,
  quantitiesByProduct,
  reopenTakes,
  type AdjustMode,
} from "./stock-rules";

/*
  Tracked stock in the database. Every count change goes through here and
  leaves a stock_movements row; the rules themselves are pure
  (stock-rules.ts). An untracked product (stock_qty null) is never touched:
  the conditional updates below simply match no row for it.
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** An order line asks for more than the shelf holds; the whole order is rolled back. */
export class StockShortage extends Error {
  constructor(
    readonly productId: string,
    readonly available: number,
  ) {
    super("insufficient_stock");
  }
}

/**
 * Takes an order's units from tracked counts, inside the order's own
 * transaction. One conditional UPDATE per product: it succeeds only while
 * enough is left, and under concurrency Postgres re-checks the condition
 * after the competing row lock is released — two orders for the last unit
 * cannot both pass. Reaching 0 marks the product sold out in the same write.
 * Returns the products whose count changed.
 */
export async function takeStock(
  tx: Tx,
  orderId: number,
  items: { productId: string; quantity: number }[],
): Promise<string[]> {
  const changed: string[] = [];
  for (const [productId, qty] of quantitiesByProduct(items)) {
    const rows = (await tx.execute(sql`
      update products
      set stock_qty = stock_qty - ${qty},
          in_stock = (stock_qty - ${qty}) > 0,
          updated_at = now()
      where id = ${productId} and stock_qty is not null and stock_qty >= ${qty}
      returning stock_qty`)) as unknown as { stock_qty: number }[];
    if (rows.length === 0) {
      const [row] = await tx.select({ qty: products.stockQty }).from(products).where(eq(products.id, productId)).limit(1);
      if (!row || row.qty == null) continue; // not tracked (or gone — the catalogue check already passed)
      throw new StockShortage(productId, row.qty);
    }
    await tx.insert(stockMovements).values({ productId, delta: -qty, reason: "order", orderId });
    changed.push(productId);
  }
  return changed;
}

export interface StockChange {
  productId: string;
  before: number;
  after: number;
}

/**
 * A cancelled order gives its units back — once. The order row is locked
 * and the amount is the net of the order's own movements, so a second cancel
 * (two admins, a double click) finds nothing left to return.
 */
export async function restoreOrderStock(orderId: number): Promise<StockChange[]> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select id from orders where id = ${orderId} for update`);
    const moves = await tx
      .select({ productId: stockMovements.productId, delta: stockMovements.delta })
      .from(stockMovements)
      .where(and(eq(stockMovements.orderId, orderId), inArray(stockMovements.reason, ["order", "cancel"])));
    const out: StockChange[] = [];
    for (const [productId, qty] of cancelRestores(moves)) {
      const rows = (await tx.execute(sql`
        update products
        set stock_qty = stock_qty + ${qty}, in_stock = true, updated_at = now()
        where id = ${productId} and stock_qty is not null
        returning stock_qty`)) as unknown as { stock_qty: number }[];
      if (rows.length === 0) continue; // tracking was switched off since
      await tx.insert(stockMovements).values({ productId, delta: qty, reason: "cancel", orderId });
      out.push({ productId, before: rows[0].stock_qty - qty, after: rows[0].stock_qty });
    }
    return out;
  });
}

/**
 * A cancelled order re-opened by the operator takes its units again, as far
 * as they still exist (a count never goes below zero — the operator sees it
 * on the products list and sorts it out with the customer).
 */
export async function reapplyOrderStock(orderId: number): Promise<StockChange[]> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select id from orders where id = ${orderId} for update`);
    const moves = await tx
      .select({ productId: stockMovements.productId, delta: stockMovements.delta, reason: stockMovements.reason })
      .from(stockMovements)
      .where(and(eq(stockMovements.orderId, orderId), inArray(stockMovements.reason, ["order", "cancel"])));
    const out: StockChange[] = [];
    for (const [productId, qty] of reopenTakes(moves)) {
      const rows = (await tx.execute(sql`
        with old as (select stock_qty from products where id = ${productId} and stock_qty is not null for update)
        update products p
        set stock_qty = greatest(p.stock_qty - ${qty}, 0),
            in_stock = greatest(p.stock_qty - ${qty}, 0) > 0,
            updated_at = now()
        from old
        where p.id = ${productId}
        returning old.stock_qty as before, p.stock_qty as after`)) as unknown as { before: number; after: number }[];
      const row = rows[0];
      if (!row || row.before === row.after) continue;
      await tx.insert(stockMovements).values({ productId, delta: row.after - row.before, reason: "order", orderId });
      out.push({ productId, before: row.before, after: row.after });
    }
    return out;
  });
}

/** The order's database id from its number (GV-000123). */
export async function orderIdOf(number: string): Promise<number | null> {
  const [row] = await getDb().select({ id: orders.id }).from(orders).where(eq(orders.number, number)).limit(1);
  return row?.id ?? null;
}

export interface ProductStockState {
  inStock: boolean;
  price: number;
  stockQty: number | null;
}

export interface AdjustResult {
  before: ProductStockState;
  after: ProductStockState;
}

/**
 * The admin's quick "+/−" / "aniq son" / "kuzatmaslik". Writes the movement
 * with the admin's note. A tracked count decides in_stock; switching
 * tracking off leaves in_stock as it was.
 */
export async function adjustStock(
  productId: string,
  change: { mode: AdjustMode; value: number } | { mode: "untrack" },
  note: string | null,
): Promise<AdjustResult | null> {
  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .select({ inStock: products.inStock, price: products.price, stockQty: products.stockQty })
      .from(products)
      .where(eq(products.id, productId))
      .for("update")
      .limit(1);
    if (!row) return null;
    if (change.mode === "untrack") {
      await tx.update(products).set({ stockQty: null, updatedAt: new Date() }).where(eq(products.id, productId));
      return { before: row, after: { ...row, stockQty: null } };
    }
    const next = adjustedQty(row.stockQty, change.mode, change.value);
    const delta = next - (row.stockQty ?? 0);
    await tx.update(products).set({ stockQty: next, inStock: next > 0, updatedAt: new Date() }).where(eq(products.id, productId));
    if (delta !== 0) await tx.insert(stockMovements).values({ productId, delta, reason: "manual", adminNote: note });
    return { before: row, after: { ...row, stockQty: next, inStock: next > 0 } };
  });
}

/** A movement for a count set from the product form (the form wrote the row itself). */
export async function recordManualMovement(productId: string, before: number | null, after: number | null, note: string): Promise<void> {
  if (after == null) return;
  const delta = after - (before ?? 0);
  if (delta === 0) return;
  await getDb().insert(stockMovements).values({ productId, delta, reason: "manual", adminNote: note });
}

export async function stockHistory(productId: string, limit = 20) {
  return getDb()
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.id))
    .limit(limit);
}

/** The site-wide "kam qoldi" threshold (site_settings), default 5. */
export async function readLowStockDefault(db: Db = getDb()): Promise<number> {
  try {
    const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, LOW_STOCK_SETTING_KEY)).limit(1);
    return parseLowStockAt(row?.value);
  } catch {
    return DEFAULT_LOW_STOCK_AT;
  }
}

export async function saveLowStockDefault(value: number, adminUserId: number): Promise<void> {
  const text = String(parseLowStockAt(String(value)));
  await getDb()
    .insert(siteSettings)
    .values({ key: LOW_STOCK_SETTING_KEY, value: text, updatedBy: adminUserId })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: text, updatedBy: adminUserId, updatedAt: new Date() } });
}
