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
    sees the size of each audience;
  - bot: Telegram club members, reachable in the bot itself even before they
    link a phone — the only way to write to someone who started the bot but
    never ordered. Campaigns to a bot audience keep the same outbox, quiet
    hours, opt-out and click attribution as the other two kinds.
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

/*
  One row per bot member: who they are, whether the phone is known, what they
  bought and what is sitting in their Telegram cart. `blocked_at` comes from
  the bot (it sets it when Telegram refuses a message), so a blocked member is
  visible but never counted as reachable.
*/
const BOT_SOURCE = sql`(
  with members as (
    -- A phone link proves a chat; a bot member may not have linked yet. Both
    -- belong to the audience, so neither side may drop the other.
    select coalesce(m.chat_id, l.chat_id) as chat_id, m.blocked_at, l.name, l.phone,
           right(regexp_replace(coalesce(l.phone, ''), '[^0-9]', '', 'g'), 9) as phone9
    from bot_members m
    full join telegram_links l on l.chat_id = m.chat_id
  ), bought as (
    select right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 9) as phone9,
           count(*) filter (where status <> 'cancelled') as orders,
           coalesce(sum(total) filter (where status <> 'cancelled'), 0) as ltv,
           max(created_at) filter (where status <> 'cancelled') as last_at
    from orders
    where length(regexp_replace(customer->>'phone', '[^0-9]', '', 'g')) >= 9
    group by 1
  ), carts as (
    select c.chat_id,
           sum(coalesce(p.price, 0) * (line->>'qty')::int) as cart_value,
           max(c.updated_at) as cart_at
    from bot_carts c
    cross join lateral jsonb_array_elements(c.lines) line
    left join products p on p.slug = line->>'slug'
    where jsonb_array_length(c.lines) > 0
    group by 1
  )
  select members.chat_id, members.name, members.phone, members.phone9, members.blocked_at,
         coalesce(bought.orders, 0) as orders,
         coalesce(bought.ltv, 0) as ltv,
         bought.last_at,
         coalesce(carts.cart_value, 0) as cart_value,
         carts.cart_at
  from members
  left join bought on bought.phone9 = members.phone9 and members.phone9 <> ''
  left join carts on carts.chat_id = members.chat_id
)`;

export type SegmentKind = "customers" | "visitors" | "bot";

export interface SegmentDef {
  id: string;
  kind: SegmentKind;
  title: string;
  description: string;
  action: string;
  where: SQL;
  /** What the "value" number means; customers default to lifetime spend. */
  value?: SQL;
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
  {
    id: "bot-all",
    kind: "bot",
    title: "Bot aʼzolari",
    description: "Botni ishga tushirgan va uni bloklamagan barcha mijozlar — eng katta Telegram auditoriyasi.",
    action: "Yangilik yoki aksiya eʼloni",
    where: sql`blocked_at is null`,
  },
  {
    id: "bot-linked",
    kind: "bot",
    title: "Telefoni bogʻlangan",
    description: "Botda telefon raqamini ulashgan aʼzolar — buyurtmalar va sodiqlik shu raqamga bogʻlanadi.",
    action: "Buyurtma holati va shaxsiy taklif",
    where: sql`phone9 <> '' and blocked_at is null`,
  },
  {
    id: "bot-buyers",
    kind: "bot",
    title: "Botdan xarid qilganlar",
    description: "Telefoni bogʻlangan va kamida bitta bekor qilinmagan buyurtmasi bor aʼzolar.",
    action: "Takroriy buyurtma va sodiqlik taklifi",
    where: sql`orders > 0 and blocked_at is null`,
  },
  {
    id: "bot-new",
    kind: "bot",
    title: "Xarid qilmagan aʼzolar",
    description: "Telefonini ulagan, lekin hali birinchi buyurtmani bermagan aʼzolar.",
    action: "Birinchi buyurtma uchun taklif",
    where: sql`phone9 <> '' and orders = 0 and blocked_at is null`,
  },
  {
    id: "bot-cart",
    kind: "bot",
    title: "Botda savatni tashlab ketgan",
    description: "Telegram savatida mahsulot qoldirib, 1 soatdan 30 kungacha buyurtma bermagan aʼzolar.",
    action: "Savat eslatmasi — avtomatik oqim ham shu auditoriyaga yozadi",
    where: sql`cart_value > 0 and cart_at between now() - interval '30 days' and now() - interval '1 hour' and (last_at is null or last_at < cart_at)`,
    value: sql`cart_value`,
  },
];

/**
 * The per-recipient key a campaign dedupes on: the phone tail when we have
 * one, otherwise the chat id. A bot member without a phone still needs a
 * stable key, or the same person could receive a campaign twice.
 */
export function campaignTargetKey(phone9: string | null, chatId: number | null): string | null {
  return phone9 && /^\d{9}$/.test(phone9) ? phone9 : chatId ? `tg${chatId}` : null;
}

export function segmentById(id: string): SegmentDef | undefined {
  return SEGMENTS.find((segment) => segment.id === id);
}

async function query(statement: SQL): Promise<Row[]> {
  return (await getDb().execute(statement)) as unknown as Row[];
}

export async function segmentCounts(): Promise<Record<string, { size: number; reachable: number; value: number }>> {
  const customers = SEGMENTS.filter((s) => s.kind === "customers");
  const visitors = SEGMENTS.filter((s) => s.kind === "visitors");
  const bots = SEGMENTS.filter((s) => s.kind === "bot");
  const [c, v, b] = await Promise.all([
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
    query(sql`
      select ${sql.join(
        bots.flatMap((s) => [
          sql`count(*) filter (where ${s.where}) as ${sql.identifier(`${s.id}:size`)}`,
          sql`count(*) filter (where ${s.where} and blocked_at is null) as ${sql.identifier(`${s.id}:reach`)}`,
          sql`coalesce(sum(${s.value ?? sql`ltv`}) filter (where ${s.where}), 0) as ${sql.identifier(`${s.id}:value`)}`,
        ]),
        sql`, `,
      )}
      from ${BOT_SOURCE} b`),
  ]);
  const out: Record<string, { size: number; reachable: number; value: number }> = {};
  for (const s of SEGMENTS) {
    const row = (s.kind === "customers" ? c[0] : s.kind === "visitors" ? v[0] : b[0]) ?? {};
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
  if (segment.kind === "bot") {
    const rows = await query(sql`
      select * from ${BOT_SOURCE} b
      where ${segment.where}
      order by coalesce(last_at, cart_at) desc nulls last
      limit ${limit}`);
    return rows.map((row) => ({
      key: `tg${row.chat_id}`,
      name: (row.name as string) ?? null,
      phone: (row.phone as string) ?? null,
      email: null,
      orders: num(row.orders),
      value: segment.id === "bot-cart" ? num(row.cart_value) : num(row.ltv),
      lastAt: row.last_at ? new Date(row.last_at as string) : row.cart_at ? new Date(row.cart_at as string) : null,
      telegramChatId: num(row.chat_id),
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
