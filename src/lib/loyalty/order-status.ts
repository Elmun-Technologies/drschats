import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { cancelReferral, ensureReferralCode, rewardReferral } from "@/lib/referral/server";
import { both, earnedLine, joinLines, referralLine, refundLine } from "./messages";
import { syncOrderLoyalty } from "./server";
import { readLoyaltyRules } from "./settings";

/*
  Everything loyalty does when the admin changes an order's status, in one
  call from app/admin/_actions/orders.ts (both the form and the quick
  buttons): points (earn on delivery, unwind on cancel), the referral
  (reward the referrer on delivery, void it on cancel), and the lines the
  club bot adds to the customer's status message. Never throws.
*/
export async function afterOrderStatus(orderNumber: string, from: string, to: string): Promise<{ uz: string; ru: string } | null> {
  if (from === to) return null;
  try {
    const outcome = await syncOrderLoyalty(orderNumber, from, to);
    const rules = await readLoyaltyRules();
    const [order] = (await getDb().execute(sql`
      select id, right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) as phone9 from orders where number = ${orderNumber} limit 1`)) as unknown as {
      id: string | number;
      phone9: string;
    }[];
    if (!order) return null;
    const orderId = Number(order.id);

    if (to === "cancelled") {
      await cancelReferral(orderId);
      return outcome?.refunded ? both((l) => refundLine(outcome.refunded, l)) : null;
    }
    if (to !== "delivered") return null;

    await rewardReferral(orderId, rules).catch((err: Error) => console.error("[referral] reward failed:", err.message));
    const earned = outcome?.earned ? both((l) => earnedLine(outcome.earned, outcome.balance ?? outcome.earned, l)) : null;
    let share: { uz: string; ru: string } | null = null;
    if (rules.referral.enabled && order.phone9?.length === 9) {
      const code = await ensureReferralCode(order.phone9);
      if (code) share = both((l) => referralLine(code, rules.referral.friendPercent, l));
    }
    return joinLines(earned, share);
  } catch (err) {
    console.error(`[loyalty] order ${orderNumber} ${from}→${to}:`, (err as Error).message);
    return null;
  }
}
