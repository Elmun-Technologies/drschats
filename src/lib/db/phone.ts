import { sql, type SQL } from "drizzle-orm";

/*
  The SQL twin of phone9Of (lib/phone9.ts). Written exactly as the indexes
  are (orders_phone9 in 0003, telegram_links_phone9 in 0020) — Postgres uses
  an expression index only for the same expression, so a query written with
  '[^0-9]' instead of '\D' scanned the whole table.
*/
export function phone9Sql(column: SQL | SQL.Aliased | string): SQL {
  const col = typeof column === "string" ? sql.raw(column) : column;
  return sql`right(regexp_replace(${col}, '\\D', '', 'g'), 9)`;
}

/** orders.customer's phone, matching the orders_phone9 index. */
export const ORDER_PHONE9 = sql.raw(`right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9)`);
