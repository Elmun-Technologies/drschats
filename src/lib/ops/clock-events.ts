import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { MERCH_TAG } from "@/lib/merch/store";
import { revalidateFromWorker } from "./revalidate";

/*
  Prices and banners that change with the clock, not with a write: a deal of
  the day opening or closing, a banner's window, a product's sale end. The
  engine prices every read by the clock (checkout is always right), but a
  cached page kept the old price for up to its revalidate time (300 s). The
  worker asks for a fresh page as soon as such a moment has passed.
*/

let lastCheck = Date.now();

export async function clockEventsSince(fromIso: string, toIso: string): Promise<number> {
  const rows = (await getDb().execute(sql`
    select
      (select count(*)::int from deals where (starts_at > ${fromIso}::timestamptz and starts_at <= ${toIso}::timestamptz)
                                        or (ends_at > ${fromIso}::timestamptz and ends_at <= ${toIso}::timestamptz))
    + (select count(*)::int from banners where (starts_at > ${fromIso}::timestamptz and starts_at <= ${toIso}::timestamptz)
                                          or (ends_at > ${fromIso}::timestamptz and ends_at <= ${toIso}::timestamptz))
    + (select count(*)::int from products where sale_ends_at > ${fromIso}::timestamptz and sale_ends_at <= ${toIso}::timestamptz)
    as n`)) as unknown as { n: number }[];
  return Number(rows[0]?.n ?? 0);
}

export async function refreshOnClockEvents(now = new Date()): Promise<number> {
  const from = new Date(lastCheck).toISOString();
  const to = now.toISOString();
  const n = await clockEventsSince(from, to);
  lastCheck = now.getTime();
  if (n > 0) await revalidateFromWorker({ tags: [MERCH_TAG, CATALOG_TAG], paths: [["/", "layout"]] });
  return n;
}

/*
  A deploy builds without a database (the Docker build has none), so the
  pages prerendered at build time — the home page and the category pages —
  hold the built-in catalogue. Once the server is up with a database, the
  whole cache is dropped so the first visitors get the real catalogue, not
  a 5-minute-old mock.
*/
export async function refreshAfterBoot(): Promise<boolean> {
  return revalidateFromWorker({ tags: [CATALOG_TAG, MERCH_TAG], paths: [["/", "layout"]] });
}
