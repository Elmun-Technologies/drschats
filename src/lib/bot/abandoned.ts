import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { enrollSubject } from "@/lib/flows/engine";
import { quoteBotCart } from "./shop";

/*
  Bot carts are rows in bot_carts, so they never reach the website's
  `visitors` trigger and would silently skip the "Tashlab ketilgan savat"
  flow. This sweep puts them back into the same flow the site uses: the same
  texts, the same quiet hours, the same opt-out and the same conversion check
  (an order after the cart's last touch ends the flow).

  Only carts that are actually abandoned are enrolled: idle for two hours,
  still holding something, and the chat has a verified phone number. The
  cycle includes the cart's last-touch hour, so refilling the cart starts a
  new cycle while a single abandoned cart is enrolled once.

  The enrolment is anchored at the cart's last touch, exactly as the site's
  visitor trigger is: step delays count from the abandonment, not from the
  moment the sweep noticed it. Anchoring at `now` would message a customer
  who left at 09:00 some time after 12:00, and the conversion check ("an
  order since the anchor") would ignore orders placed in between.
*/

export const ABANDON_AFTER_MS = 2 * 60 * 60_000;
/** A cart idle for longer than this is stale, not abandoned — the customer has moved on. */
export const ABANDON_WINDOW_MS = 26 * 60 * 60_000;

/** `YYYYMMDDTHHMMSS` (UTC) from `to_char` → the moment the cart was last touched. */
export function touchMoment(touched: string): Date {
  return new Date(
    Date.UTC(
      Number(touched.slice(0, 4)),
      Number(touched.slice(4, 6)) - 1,
      Number(touched.slice(6, 8)),
      Number(touched.slice(9, 11)),
      Number(touched.slice(11, 13)),
      Number(touched.slice(13, 15)),
    ),
  );
}

export interface CartSweepResult {
  candidates: number;
  enrolled: number;
}

export async function sweepBotCarts(now = new Date(), limit = 25): Promise<CartSweepResult> {
  const from = new Date(now.getTime() - ABANDON_WINDOW_MS);
  const until = new Date(now.getTime() - ABANDON_AFTER_MS);
  let rows: { chat_id: string; phone: string; name: string | null; locale: string; touched: string }[];
  try {
    rows = (await getDb().execute(sql`
      select c.chat_id, l.phone, l.name, c.locale,
             to_char(c.updated_at at time zone 'UTC', 'YYYYMMDD"T"HH24MISS') as touched
      from bot_carts c
      join telegram_links l on l.chat_id = c.chat_id
      where jsonb_array_length(c.lines) > 0
        and c.updated_at between ${from.toISOString()}::timestamptz and ${until.toISOString()}::timestamptz
        and not exists (
          select 1 from orders o
          where o.created_at > c.updated_at
            and right(regexp_replace(o.customer->>'phone', '\\D', '', 'g'), 9) = right(regexp_replace(l.phone, '\\D', '', 'g'), 9))
      order by c.updated_at asc
      limit ${limit}`)) as unknown as { chat_id: string; phone: string; name: string | null; locale: string; touched: string }[];
  } catch (err) {
    // Without 0012 (or before the bot ever had a cart) there is nothing to do.
    console.error("[bot-carts] sweep query failed:", (err as Error).message);
    return { candidates: 0, enrolled: 0 };
  }
  let enrolled = 0;
  for (const row of rows) {
    try {
      const chatId = Number(row.chat_id);
      const quote = await quoteBotCart({ chatId });
      if (quote.lines.length === 0) continue;
      const cartItems = quote.lines.map((l) => ({ name: l.name, quantity: l.qty, price: l.price }));
      const outcome = await enrollSubject({
        flowId: "cart-abandoned",
        subject: row.phone.replace(/\D/g, "").slice(-9),
        cycle: `bot:${row.chat_id}:${row.touched}`.slice(0, 120),
        anchor: touchMoment(row.touched),
        context: {
          name: row.name,
          locale: row.locale === "ru" ? "ru" : "uz",
          cartValue: quote.totals.total,
          cartItems,
          source: "telegram_bot",
        },
      });
      if (outcome === "enrolled") enrolled += 1;
    } catch (err) {
      console.error("[bot-carts] enroll failed:", (err as Error).message);
    }
  }
  return { candidates: rows.length, enrolled };
}
