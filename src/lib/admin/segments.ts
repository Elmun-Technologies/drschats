import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { SegmentMember } from "./segment-export";

/*
  Retargeting segments. Two kinds:
  - customers: people who ordered, keyed by phone tail, built from orders —
    they can be exported (phone/email, raw or hashed for ad platforms) and
    messaged in Telegram when they linked the club bot;
  - visitors: anonymous browsers from the journey — reachable through the
    ad pixels (GA4 / Meta / Metrika audiences), counted here so the team
    sees the size of each audience.
*/

type Row = Record<string, unknown>;
const num = (value: unknown) => Number(value ?? 0);

const CUSTOMER_STATS = sql`
  with stats as (
    select right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 9) as phone9,
           (array_agg(customer->>'name' order by created_at desc))[1] as name,
           (array_agg(customer->>'phone' order by created_at desc))[1] as phone,
           (array_agg(nullif(customer->>'email', '') order by created_at desc) filter (where nullif(customer->>'email', '') is not null))[1] as email,
           count(*) filter (where status <> 'cancelled') as orders,
           coalesce(sum(total) filter (where status <> 'cancelled'), 0) as ltv,
           min(created_at) filter (where status <> 'cancelled') as first_at,
           max(created_at) filter (where status <> 'cancelled') as last_at
    from orders
    where length(regexp_replace(customer->>'phone', '[^0-9]', '', 'g')) >= 9
    group by 1
  )`;

export type SegmentKind = "customers" | "visitors";

export interface SegmentDef {
  id: string;
  kind: SegmentKind;
  title: string;
  description: string;
  action: string;
  where: SQL;
}

export const SEGMENTS: SegmentDef[] = [
  {
    id: "course-ending",
    kind: "customers",
    title: "Kursi tugayapti",
    description: "Oxirgi xaridiga 25–40 kun boʻlgan mijozlar — oylik kurs tugash vaqti.",
    action: "Takroriy buyurtma eslatmasi yuboring",
    where: sql`orders > 0 and last_at between now() - interval '40 days' and now() - interval '25 days'`,
  },
  {
    id: "one-time",
    kind: "customers",
    title: "Bir marta sotib olgan",
    description: "Faqat bitta buyurtma bergan va 30 kundan beri qaytmagan mijozlar.",
    action: "Ikkinchi xarid uchun taklif",
    where: sql`orders = 1 and last_at < now() - interval '30 days'`,
  },
  {
    id: "lapsed-60",
    kind: "customers",
    title: "60+ kun sotib olmagan",
    description: "Avval xarid qilgan, lekin 60–180 kundan beri buyurtma bermagan mijozlar.",
    action: "Qaytarish aksiyasi",
    where: sql`orders > 0 and last_at between now() - interval '180 days' and now() - interval '60 days'`,
  },
  {
    id: "lost",
    kind: "customers",
    title: "Yoʻqotilgan mijozlar",
    description: "180 kundan ortiq xarid qilmagan mijozlar.",
    action: "Kuchli qaytarish taklifi yoki soʻrovnoma",
    where: sql`orders > 0 and last_at < now() - interval '180 days'`,
  },
  {
    id: "vip",
    kind: "customers",
    title: "VIP mijozlar",
    description: "3 va undan ortiq buyurtma yoki jami 1 000 000 soʻmdan ortiq xarid.",
    action: "Yopiq aksiya, yangi mahsulotlarni birinchi boʻlib taklif qilish",
    where: sql`orders >= 3 or ltv >= 1000000`,
  },
  {
    id: "new-7d",
    kind: "customers",
    title: "Yangi mijozlar (7 kun)",
    description: "Birinchi buyurtmasi oxirgi 7 kun ichida boʻlgan mijozlar.",
    action: "Rahmat xabari va qabul qilish boʻyicha maslahat",
    where: sql`first_at >= now() - interval '7 days'`,
  },
  {
    id: "abandoned-cart",
    kind: "visitors",
    title: "Savatni tashlab ketgan",
    description: "Savatga qoʻshgan, lekin 1 soatdan 30 kungacha buyurtma bermagan tashrif buyuruvchilar.",
    action: "Meta / Google remarketing, telefoni maʼlum boʻlsa — qoʻngʻiroq",
    where: sql`cart_value > 0 and cart_at between now() - interval '30 days' and now() - interval '1 hour' and (last_order_at is null or last_order_at < cart_at)`,
  },
  {
    id: "checkout-dropped",
    kind: "visitors",
    title: "Rasmiylashtirishda toʻxtagan",
    description: "Buyurtma formasini ochgan, lekin yubormagan (oxirgi 30 kun).",
    action: "Eng issiq auditoriya — remarketingda eng yuqori stavka",
    where: sql`stage = 'checkout' and last_seen_at > now() - interval '30 days'`,
  },
  {
    id: "browsers",
    kind: "visitors",
    title: "Mahsulot koʻrgan, savatga qoʻshmagan",
    description: "Oxirgi 14 kunda mahsulot sahifasini koʻrgan, lekin savatga qoʻshmagan.",
    action: "Koʻrgan mahsulotlari bilan dinamik remarketing",
    where: sql`stage = 'product' and last_seen_at > now() - interval '14 days'`,
  },
];

export function segmentById(id: string): SegmentDef | undefined {
  return SEGMENTS.find((segment) => segment.id === id);
}

async function query(statement: SQL): Promise<Row[]> {
  return (await getDb().execute(statement)) as unknown as Row[];
}

export async function segmentCounts(): Promise<Record<string, { size: number; reachable: number; value: number }>> {
  const customers = SEGMENTS.filter((s) => s.kind === "customers");
  const visitors = SEGMENTS.filter((s) => s.kind === "visitors");
  const [c, v] = await Promise.all([
    query(sql`${CUSTOMER_STATS}
      select ${sql.join(
        customers.flatMap((s) => [
          sql`count(*) filter (where ${s.where}) as ${sql.identifier(`${s.id}:size`)}`,
          sql`count(*) filter (where (${s.where}) and exists (select 1 from telegram_links t where right(regexp_replace(t.phone, '[^0-9]', '', 'g'), 9) = stats.phone9)) as ${sql.identifier(`${s.id}:reach`)}`,
          sql`coalesce(sum(ltv) filter (where ${s.where}), 0) as ${sql.identifier(`${s.id}:value`)}`,
        ]),
        sql`, `,
      )}
      from stats`),
    query(sql`
      select ${sql.join(
        visitors.flatMap((s) => [
          sql`count(*) filter (where ${s.where}) as ${sql.identifier(`${s.id}:size`)}`,
          sql`count(*) filter (where (${s.where}) and phone9 is not null) as ${sql.identifier(`${s.id}:reach`)}`,
          sql`coalesce(sum(cart_value) filter (where ${s.where}), 0) as ${sql.identifier(`${s.id}:value`)}`,
        ]),
        sql`, `,
      )}
      from visitors`),
  ]);
  const out: Record<string, { size: number; reachable: number; value: number }> = {};
  for (const s of SEGMENTS) {
    const row = (s.kind === "customers" ? c[0] : v[0]) ?? {};
    out[s.id] = { size: num(row[`${s.id}:size`]), reachable: num(row[`${s.id}:reach`]), value: num(row[`${s.id}:value`]) };
  }
  return out;
}


export async function segmentMembers(segment: SegmentDef, limit = 500): Promise<SegmentMember[]> {
  if (segment.kind === "customers") {
    const rows = await query(sql`${CUSTOMER_STATS}
      select stats.*, t.chat_id
      from stats
      left join lateral (
        select chat_id from telegram_links t
        where right(regexp_replace(t.phone, '[^0-9]', '', 'g'), 9) = stats.phone9
        limit 1
      ) t on true
      where ${segment.where}
      order by last_at desc nulls last
      limit ${limit}`);
    return rows.map((row) => ({
      key: String(row.phone9),
      name: (row.name as string) ?? null,
      phone: (row.phone as string) ?? null,
      email: (row.email as string) ?? null,
      orders: num(row.orders),
      value: num(row.ltv),
      lastAt: row.last_at ? new Date(row.last_at as string) : null,
      telegramChatId: row.chat_id == null ? null : num(row.chat_id),
    }));
  }
  const rows = await query(sql`
    select v.*, t.chat_id
    from visitors v
    left join lateral (
      select chat_id from telegram_links t
      where v.phone9 is not null and right(regexp_replace(t.phone, '[^0-9]', '', 'g'), 9) = v.phone9
      limit 1
    ) t on true
    where ${segment.where}
    order by v.last_seen_at desc
    limit ${limit}`);
  return rows.map((row) => ({
    key: String(row.id),
    name: (row.name as string) ?? null,
    phone: row.phone9 ? `+998${row.phone9}` : null,
    email: null,
    orders: num(row.orders_count),
    value: num(row.cart_value),
    lastAt: row.last_seen_at ? new Date(row.last_seen_at as string) : null,
    telegramChatId: row.chat_id == null ? null : num(row.chat_id),
  }));
}
