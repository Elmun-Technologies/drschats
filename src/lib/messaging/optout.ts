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
