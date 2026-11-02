import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ORDER_PHONE9, phone9Sql } from "@/lib/db/phone";

/*
  "Delete my data": a customer's personal data is erased everywhere the shop
  keeps it, in one transaction, from /admin/customers/[phone9] (owner only,
  audit-logged).

  Orders stay — they are the shop's accounting record — but lose the name,
  phone, email, address and the operator's note; totals, items, dates and
  status are kept, so reports still add up. Everything that exists only
  because of this person (visits, notes, waitlist requests, messages, points,
  referral codes, birthday, flow enrollments, the bot link) is deleted.
  The marketing opt-out (STOP) is kept on purpose: it is the one record that
  stops the shop from writing to that number again if it ever reappears.
*/

export const ANONYMISED_NAME = "Oʻchirilgan mijoz";

export type AnonymiseResult = Record<string, number>;

export async function anonymiseCustomer(phone9: string): Promise<AnonymiseResult> {
  if (!/^[0-9]{9}$/.test(phone9)) throw new Error("phone9 must be 9 digits");
  return getDb().transaction(async (tx) => {
    const out: AnonymiseResult = {};
    const count = async (label: string, query: SQL) => {
      const rows = (await tx.execute(query)) as unknown as unknown[];
      out[label] = rows.length;
    };
    // Serialised with orders from the same phone (lib/promo/server.ts takes the same lock).
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`gv-order-phone:${phone9}`}))`);
    await count(
      "orders",
      sql`update orders set
            customer = jsonb_build_object('name', ${ANONYMISED_NAME}::text, 'phone', '', 'email', null),
            delivery = jsonb_build_object('region', delivery ->> 'region', 'address', '', 'method', delivery ->> 'method'),
            admin_note = null, telegram_chat_id = null, visitor_id = null, updated_at = now()
          where ${ORDER_PHONE9} = ${phone9} returning 1`,
    );
    await count("visitors", sql`delete from visitors where phone9 = ${phone9} returning 1`);
    await count("notes", sql`delete from admin_customer_notes where phone9 = ${phone9} returning 1`);
    await count("waitlist", sql`delete from restock_requests where phone9 = ${phone9} returning 1`);
    await count("messages", sql`delete from outbound_messages where phone9 = ${phone9} returning 1`);
    await count("flows", sql`delete from flow_enrollments where subject = ${phone9} returning 1`);
    await count("points", sql`delete from loyalty_ledger where phone9 = ${phone9} returning 1`);
    await count("codes", sql`delete from loyalty_otps where phone9 = ${phone9} returning 1`);
    await count("referrals", sql`delete from referrals where referrer_phone9 = ${phone9} or referred_phone9 = ${phone9} returning 1`);
    await count("referral_code", sql`delete from referral_codes where phone9 = ${phone9} returning 1`);
    await count("birthday", sql`delete from customer_birthdays where phone9 = ${phone9} returning 1`);
    await count("telegram", sql`delete from telegram_links where ${phone9Sql("phone")} = ${phone9} returning 1`);
    // Personal promo codes stop working; redemptions keep their count, not the number.
    await count("promo_codes", sql`update promo_codes set phone9 = null, active = false where phone9 = ${phone9} returning 1`);
    await count("redemptions", sql`update promo_redemptions set phone9 = '000000000' where phone9 = ${phone9} returning 1`);
    return Object.fromEntries(Object.entries(out).filter(([, n]) => n > 0));
  });
}
