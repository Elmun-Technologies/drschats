import { sql, type SQL } from "drizzle-orm";
import type { FlowTrigger } from "./types";

/*
  Who enters a flow. Each trigger is one query returning candidates
  (subject = phone tail, cycle = what started this run, anchor = the trigger
  moment, context = what the texts need) whose anchor lies in [from, to] —
  see schedule.ts → enrollmentWindow. Enrolling is an INSERT … ON CONFLICT
  DO NOTHING on (flow_id, subject, cycle), so running it every few minutes,
  from two processes, or after a restart never enrolls anyone twice.

  A phone is required: an anonymous visitor's cart is a retargeting audience
  (/admin/segments), not someone we may text. visitors.phone9 is known once
  the browser placed an order before, and the Telegram link is phone-based.
*/

const PHONE9 = (column: SQL) => sql`right(regexp_replace(${column}, '\\D', '', 'g'), 9)`;
const ORDER_PHONE = PHONE9(sql`o.customer->>'phone'`);

export interface TriggerWindow {
  from: Date;
  to: Date;
}

const iso = (d: Date) => sql`${d.toISOString()}::timestamptz`;

/** Customers' latest and first non-cancelled orders, by phone tail. */
const CUSTOMER_ORDERS = sql`
  select distinct on (phone9) phone9, o.id, o.number, o.created_at, o.locale, o.customer->>'name' as name, o.items, o.status, o.updated_at
  from (select o.*, ${ORDER_PHONE} as phone9 from orders o where o.status <> 'cancelled') o
  where length(phone9) = 9`;

export interface TriggerOptions {
  /** birthday: how many days before the date the flow starts (loyalty.rules → birthday.daysBefore). */
  birthdayDaysBefore?: number;
}

export function candidateQuery(trigger: FlowTrigger, window: TriggerWindow, options: TriggerOptions = {}): SQL | null {
  const { from, to } = window;
  switch (trigger) {
    case "cart_abandoned":
      return sql`
        select distinct on (v.phone9) v.phone9 as subject,
               to_char(v.cart_at at time zone 'UTC', 'YYYYMMDD"T"HH24MISS') as cycle,
               v.cart_at as anchor,
               jsonb_build_object('visitorId', v.id, 'name', v.name, 'locale', v.locale,
                                  'cartValue', v.cart_value, 'cartItems', v.cart_items) as context
        from visitors v
        where v.phone9 is not null and v.cart_value > 0
          and v.cart_at between ${iso(from)} and ${iso(to)}
          and (v.last_order_at is null or v.last_order_at < v.cart_at)
          and not exists (select 1 from orders o where o.created_at > v.cart_at and ${ORDER_PHONE} = v.phone9)
        order by v.phone9, v.cart_at desc`;
    case "checkout_dropped":
      return sql`
        select distinct on (v.phone9) v.phone9 as subject,
               to_char(ev.at at time zone 'UTC', 'YYYYMMDD"T"HH24MISS') as cycle,
               ev.at as anchor,
               jsonb_build_object('visitorId', v.id, 'name', v.name, 'locale', v.locale,
                                  'cartValue', v.cart_value, 'cartItems', v.cart_items) as context
        from visitors v
        join lateral (select max(created_at) as at from visitor_events e where e.visitor_id = v.id and e.type = 'begin_checkout') ev on ev.at is not null
        where v.phone9 is not null
          and ev.at between ${iso(from)} and ${iso(to)}
          and (v.last_order_at is null or v.last_order_at < ev.at)
          and not exists (select 1 from orders o where o.created_at > ev.at and ${ORDER_PHONE} = v.phone9)
        order by v.phone9, ev.at desc`;
    case "first_order_delivered":
      return sql`
        with firsts as (${CUSTOMER_ORDERS} order by phone9, o.created_at asc)
        select f.phone9 as subject, f.id::text as cycle, d.at as anchor,
               jsonb_build_object('name', f.name, 'locale', f.locale, 'orderId', f.id, 'orderNumber', f.number,
                                  'cartItems', f.items) as context
        from firsts f
        cross join lateral (
          select coalesce((select max(created_at) from bot_order_events b where b.order_id = f.id and b.status = 'delivered'), f.updated_at) as at
        ) d
        where f.status = 'delivered' and d.at between ${iso(from)} and ${iso(to)}`;
    case "course_ending":
    case "lapsed":
      return sql`
        with latest as (${CUSTOMER_ORDERS} order by phone9, o.created_at desc)
        select l.phone9 as subject, l.id::text as cycle, l.created_at as anchor,
               jsonb_build_object('name', l.name, 'locale', l.locale, 'orderId', l.id, 'orderNumber', l.number,
                                  'cartItems', l.items) as context
        from latest l
        where l.created_at between ${iso(from)} and ${iso(to)}`;
    case "birthday": {
      /*
        Opt-ins from /profile (customer_birthdays). The anchor is midnight
        Tashkent `daysBefore` days before this year's (or next year's)
        birthday — 29 February falls on the 28th in other years — and the
        cycle is that year, so a customer is greeted once a year. Only phones
        that ordered before: the opt-in carries no proof of the number, and a
        greeting must not become a way to text strangers.
      */
      const before = Math.max(0, Math.min(30, Math.round(options.birthdayDaysBefore ?? 3)));
      return sql`
        select b.phone9 as subject, y.year::text as cycle, a.anchor,
               jsonb_build_object('name', b.name, 'locale', b.locale) as context
        from customer_birthdays b
        cross join (select generate_series(
          extract(year from ${iso(to)} at time zone 'Asia/Tashkent')::int - 1,
          extract(year from ${iso(to)} at time zone 'Asia/Tashkent')::int + 1) as year) y
        cross join lateral (
          select (make_date(y.year, b.month,
                    case when b.month = 2 and b.day = 29 and not ((y.year % 4 = 0 and y.year % 100 <> 0) or y.year % 400 = 0) then 28 else b.day end
                  )::timestamp at time zone 'Asia/Tashkent') - make_interval(days => ${before}) as anchor
        ) a
        where a.anchor between ${iso(from)} and ${iso(to)}
          and exists (select 1 from orders o where o.status <> 'cancelled' and ${ORDER_PHONE} = b.phone9)`;
    }
    case "restock":
      // restock: enrolled by enqueueRestockMessage() (lib/flows/restock.ts).
      return null;
  }
}

/*
  An order from the subject after the anchor — the customer came back; the
  flow stops.

  Conversion is judged at millisecond precision, on purpose. The anchor is
  written by `enroll` from a database timestamp (microseconds) but comes back
  through node-postgres as a JS Date (milliseconds) when `advance` reads the
  row. Comparing the full-precision order (`course-ending` and `lapsed` are
  anchored at the order's own `created_at`) would then look "later than" its
  own anchor by the microseconds lost in the round trip and close the
  enrollment before its first step — the flow would never send anything.
  Truncating both sides to the millisecond makes the triggering order equal
  to its anchor, while a real repeat order (seconds or minutes later) still
  converts.
*/
export function conversionQuery(subject: string, anchor: Date, visitorId: string | null): SQL {
  return sql`
    select o.id from orders o
    where date_trunc('milliseconds', o.created_at) > ${iso(anchor)}
      and (${ORDER_PHONE} = ${subject} ${visitorId ? sql`or o.visitor_id = ${visitorId}::uuid` : sql``})
    order by o.created_at asc
    limit 1`;
}
