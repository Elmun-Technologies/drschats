import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

/*
  Prior consent to advertising SMS. Since 2026-11-01 (presidential decree of
  2026-07-15) an advertising SMS may only go to a number whose owner agreed
  to it in writing or electronically, and the sender must be registered in
  the State Register of Personal Data Bases (pd.gov.uz).

  A STOP (marketing_optouts) still wins: consent given at checkout and a later
  "stop" means no SMS. Order SMS (kind 'transactional') are not advertising and
  a message the customer asked for (outbound_messages.requested) carries its
  own consent. Telegram is not a mobile-network SMS and is not gated here.
*/

type Db = ReturnType<typeof getDb>;
type Exec = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Version tag of the wording the customer ticked; bump it when the checkbox text changes. */
export const SMS_CONSENT_TEXT = "checkout-v1: Aksiyalar va eslatmalarni SMS orqali olishga roziman";

export async function hasSmsConsent(exec: Exec, phone9: string | null): Promise<boolean> {
  if (!phone9) return false;
  const rows = (await exec.execute(sql`select 1 from sms_marketing_consents where phone9 = ${phone9} limit 1`)) as unknown as unknown[];
  return rows.length > 0;
}

/** The consents of many phones in one query. */
export async function smsConsentsOf(exec: Exec, phones: (string | null)[]): Promise<Set<string>> {
  const unique = [...new Set(phones.filter((p): p is string => Boolean(p)))];
  if (unique.length === 0) return new Set();
  const rows = (await exec.execute(sql`
    select phone9 from sms_marketing_consents
    where phone9 in (${sql.join(unique.map((p) => sql`${p}`), sql`, `)})`)) as unknown as { phone9: string }[];
  return new Set(rows.map((r) => r.phone9));
}

/** Records a consent. The first one is kept: its time and wording are the evidence. */
export async function recordSmsConsent(exec: Exec, phone9: string, source: string, text = SMS_CONSENT_TEXT): Promise<void> {
  if (!/^[0-9]{9}$/.test(phone9)) return;
  await exec.execute(sql`
    insert into sms_marketing_consents (phone9, source, consent_text) values (${phone9}, ${source}, ${text})
    on conflict (phone9) do nothing`);
}

export async function smsConsentCount(): Promise<number> {
  const rows = (await getDb().execute(sql`select count(*) as n from sms_marketing_consents`)) as unknown as { n: string }[];
  return Number(rows[0]?.n ?? 0);
}
