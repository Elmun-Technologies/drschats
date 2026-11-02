import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { OptOutChannel } from "@/lib/db/schema";

type Db = ReturnType<typeof getDb>;
type Exec = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

/** True when the customer stopped this channel (or every marketing channel). */
export async function isOptedOut(exec: Exec, phone9: string | null, channel: "sms" | "telegram"): Promise<boolean> {
  if (!phone9) return false;
  const rows = (await exec.execute(sql`
    select 1 from marketing_optouts where phone9 = ${phone9} and channel in (${channel}, 'all') limit 1`)) as unknown as unknown[];
  return rows.length > 0;
}

/** The opt-outs of many phones in one query: a Set of "phone9:channel" (channel sms, telegram or all). */
export async function optOutsOf(exec: Exec, phones: string[]): Promise<Set<string>> {
  const unique = [...new Set(phones.filter(Boolean))];
  if (unique.length === 0) return new Set();
  const rows = (await exec.execute(sql`
    select phone9, channel from marketing_optouts
    where phone9 in (${sql.join(unique.map((p) => sql`${p}`), sql`, `)})`)) as unknown as { phone9: string; channel: string }[];
  return new Set(rows.map((r) => `${r.phone9}:${r.channel}`));
}

/** Reads a Set from optOutsOf the way isOptedOut reads the table. */
export function inOptOuts(set: Set<string>, phone9: string | null, channel: "sms" | "telegram"): boolean {
  return Boolean(phone9) && (set.has(`${phone9}:${channel}`) || set.has(`${phone9}:all`));
}

/** Records a "stop". Idempotent; pending messages to that channel are skipped right away. */
export async function recordOptOut(phone9: string, channel: OptOutChannel, source: string): Promise<void> {
  const db = getDb();
  await db.execute(sql`
    insert into marketing_optouts (phone9, channel, source) values (${phone9}, ${channel}, ${source})
    on conflict (phone9, channel) do nothing`);
  await db.execute(sql`
    update outbound_messages set status = 'skipped', error = 'opted_out'
    where phone9 = ${phone9} and status = 'pending'
      and ${channel === "all" ? sql`true` : sql`channel = ${channel}`}`);
}

export async function optOutCount(): Promise<number> {
  const rows = (await getDb().execute(sql`select count(distinct phone9) as n from marketing_optouts`)) as unknown as { n: string }[];
  return Number(rows[0]?.n ?? 0);
}

/** Every phone that stopped any marketing channel — for ad-audience exports. */
export async function optedOutPhones(): Promise<Set<string>> {
  const rows = (await getDb().execute(sql`select distinct phone9 from marketing_optouts`)) as unknown as { phone9: string }[];
  return new Set(rows.map((r) => r.phone9));
}
