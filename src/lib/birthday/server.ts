import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { customerBirthdays } from "@/lib/db/schema";

/*
  Birthday opt-ins (customer_birthdays). The profile itself stays in the
  browser; only what the customer explicitly sends for the greeting lands
  here, and withdrawing the consent deletes the row.
*/

export async function saveBirthday(input: { phone9: string; name: string | null; day: number; month: number; year: number | null; locale: "uz" | "ru" }): Promise<void> {
  const values = { name: input.name?.slice(0, 80) || null, day: input.day, month: input.month, year: input.year, locale: input.locale };
  await getDb()
    .insert(customerBirthdays)
    .values({ phone9: input.phone9, ...values })
    .onConflictDoUpdate({ target: customerBirthdays.phone9, set: { ...values, consentAt: sql`now()`, updatedAt: sql`now()` } });
}

export async function removeBirthday(phone9: string): Promise<void> {
  await getDb().delete(customerBirthdays).where(eq(customerBirthdays.phone9, phone9));
}

export async function birthdayOf(phone9: string): Promise<{ day: number; month: number; year: number | null; consentAt: Date } | null> {
  const [row] = await getDb().select().from(customerBirthdays).where(eq(customerBirthdays.phone9, phone9)).limit(1);
  return row ? { day: row.day, month: row.month, year: row.year, consentAt: row.consentAt } : null;
}

/**
 * What the birthday greeting gives, read from the seeded flow (admin → Avtomatlashtirish),
 * so /loyalty promises exactly what will be sent. Null when the flow is off.
 */
export async function birthdayOffer(): Promise<{ percent: number | null } | null> {
  try {
    const [row] = (await getDb().execute(sql`select steps from flows where trigger = 'birthday' and active order by id limit 1`)) as unknown as {
      steps: { promo?: { kind?: string; value?: number } | null }[];
    }[];
    if (!row) return null;
    const promo = Array.isArray(row.steps) ? row.steps.find((s) => s?.promo)?.promo : null;
    return { percent: promo?.kind === "percent" && typeof promo.value === "number" ? promo.value : null };
  } catch {
    return null;
  }
}

export async function birthdayStats():Promise<{ total: number; next30: number }> {
  const [row] = (await getDb().execute(sql`
    select count(*) as total,
           count(*) filter (where
             make_date(extract(year from now() at time zone 'Asia/Tashkent')::int, month,
               case when month = 2 and day = 29 then 28 else day end)
               between (now() at time zone 'Asia/Tashkent')::date and (now() at time zone 'Asia/Tashkent')::date + 30
             or make_date(extract(year from now() at time zone 'Asia/Tashkent')::int + 1, month,
               case when month = 2 and day = 29 then 28 else day end)
               between (now() at time zone 'Asia/Tashkent')::date and (now() at time zone 'Asia/Tashkent')::date + 30
           ) as next30
    from customer_birthdays`)) as unknown as { total: string; next30: string }[];
  return { total: Number(row?.total ?? 0), next30: Number(row?.next30 ?? 0) };
}
