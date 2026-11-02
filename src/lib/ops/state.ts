import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

/*
  Small operational facts in ops_state (0020): the worker's last tick, when
  an alert last fired. Shared by every machine, so /api/health on one
  machine sees the worker on another, and two machines do not both alert.
*/

export async function readOps<T>(key: string): Promise<{ value: T; updatedAt: Date } | null> {
  const rows = (await getDb().execute(sql`select value, updated_at from ops_state where key = ${key}`)) as unknown as { value: T; updated_at: string | Date }[];
  const row = rows[0];
  return row ? { value: row.value, updatedAt: new Date(row.updated_at) } : null;
}

export async function writeOps(key: string, value: unknown): Promise<void> {
  await getDb().execute(sql`
    insert into ops_state (key, value, updated_at) values (${key}, ${JSON.stringify(value)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`);
}

/**
 * Claims a once-per-`minutes` slot for `key` (for example an alert): true for
 * exactly one caller per window, across machines.
 */
export async function claimOnce(key: string, minutes: number): Promise<boolean> {
  const rows = (await getDb().execute(sql`
    insert into ops_state (key, value, updated_at) values (${key}, '{}'::jsonb, now())
    on conflict (key) do update set updated_at = now()
      where ops_state.updated_at < now() - (${minutes}::int * interval '1 minute')
    returning key`)) as unknown as unknown[];
  return rows.length > 0;
}
