import "server-only";

import { sql } from "drizzle-orm";
import { regionName } from "@/lib/checkout/regions";
import { notifyOperator } from "@/lib/notifications/operator";
import { ordersFromPhone } from "@/lib/catalog/db";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { readFirstOrderSetting } from "@/lib/promo/settings";
import { COMMERCE } from "@/lib/config/commerce";
import { describeAttribution } from "@/lib/analytics/attribution";
import { discountAdjustment, pointsSpent } from "@/lib/promo/rules";
import { formatMoney } from "@/lib/utils";
import type { OrderRequest } from "@/lib/shopflow/types";

/*
  The operator's copy of an order. Shared by every checkout path — the
  website form and the bot's native shop — so a bot order looks like any
  other order in the group, with one extra line saying where it came from.

  Plain text, never Markdown: a "_" or "*" in a customer's name or address
  would make Telegram reject the message and the order would reach nobody.
*/

const SOURCE_LABEL: Record<NonNullable<OrderRequest["source"]>, string> = {
  site: "🌐 Sayt",
  telegram_bot: "🤖 Telegram bot",
  telegram_mini: "📱 Telegram Mini App",
};

/*
  With the database the order-level discount is already in the total
  (lib/promo/server.ts) and the message says which one. Without it the
  first-order discount (COMMERCE.discounts.firstOrderPercent) is still the
  operator's to apply on confirmation, and the line says to check.
*/
async function discountLines(order: OrderRequest): Promise<string[]> {
  const adjustment = discountAdjustment(order.totals.adjustments);
  const lines: string[] = [];
  if (adjustment?.kind === "promo") lines.push(`🏷 Promokod ${adjustment.code}: −${formatMoney(adjustment.amount, "uz")} (qoʻllandi)`);
  if (adjustment?.kind === "referral") lines.push(`🤝 Doʻst kodi ${adjustment.code} −${adjustment.percent}%: −${formatMoney(adjustment.amount, "uz")} (qoʻllandi)`);
  const points = pointsSpent(order.totals.adjustments);
  if (points > 0) lines.push(`💎 Ball bilan toʻlandi: −${formatMoney(points, "uz")} (SMS kod bilan tasdiqlangan)`);
  if (adjustment?.kind === "first_order") {
    lines.push(`🎁 Birinchi buyurtma −${adjustment.percent}%: −${formatMoney(adjustment.amount, "uz")} (avtomatik qoʻllandi)`);
  }
  const placed = await ordersFromPhone(order.customer.phone);
  if (placed === null) lines.push(`🎁 Birinchi buyurtma boʻlsa −${COMMERCE.discounts.firstOrderPercent}% (tekshiring)`);
  else if (placed <= 1) {
    if (adjustment?.kind === "first_order") {
      // applied above
    } else if (!adjustment && order.source !== "telegram_bot") {
      /*
        The first-order discount is applied automatically only to a phone
        proven by SMS code (lib/promo/server.ts → phoneProven). A new number
        without that proof is the operator's to check on the call.
      */
      const setting = await readFirstOrderSetting().catch(() => null);
      lines.push(
        setting?.enabled
          ? `🎁 Yangi mijoz: telefon SMS bilan tasdiqlanmagan — birinchi buyurtma −${setting.percent}% qoʻllanmadi. Qoʻngʻiroqda tekshirib qoʻllang.`
          : "🎁 Yangi mijoz",
      );
    } else lines.push("🎁 Yangi mijoz");
  } else lines.push(`🔁 Qaytgan mijoz: avval ${placed - 1} ta buyurtma`);
  return lines;
}

export function operatorOrderText(order: OrderRequest, orderId: string): Promise<string> {
  const items = order.items
    .map((i) => `  • ${i.name} × ${i.quantity}${i.upsellDiscountPercent ? ` (−${i.upsellDiscountPercent}%)` : ""}${i.subscription ? ` · obuna ${i.subscription.intervalDays} kun` : ""}`)
    .join("\n");
  return discountLines(order).then((discounts) =>
    [
      `🛒 Yangi buyurtma #${orderId}`,
      `👤 ${order.customer.name} — ${order.customer.phone}`,
      order.customer.email ? `✉️ ${order.customer.email}` : "",
      `📍 ${regionName(order.delivery.region)}, ${order.delivery.address}`,
      `🚚 ${order.delivery.method}`,
      order.payment
        ? `💳 ${order.payment.method === "online" ? `Onlayn toʻlov: ${order.payment.provider === "click" ? "Click" : "Payme"} — kutilmoqda (toʻlansa alohida xabar keladi)` : "Yetkazishda toʻlov, naqd"}`
        : "",
      `\n${items}`,
      order.totals.discount > 0 ? `🏷 Chegirma: ${formatMoney(order.totals.discount, "uz")}` : "",
      `🚚 Yetkazish: ${formatMoney(order.totals.shipping, "uz")}`,
      `💰 Jami: ${formatMoney(order.totals.total, "uz")}`,
      ...discounts,
      `🧭 Kanal: ${SOURCE_LABEL[order.source ?? "site"]}`,
      describeAttribution(order.attribution) ? `📣 Manba: ${describeAttribution(order.attribution)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/**
 * The operator's ping for a new order. With orders in the database the
 * outcome is written on the order (0020): a ping Telegram did not take is
 * retried by the worker (retryOperatorPings) and flagged on the order page.
 */
export async function notifyOperatorOfOrder(order: OrderRequest, orderId: string): Promise<boolean> {
  const delivered = await notifyOperator(await operatorOrderText(order, orderId));
  await markOperatorPing(orderId, delivered);
  return delivered;
}

async function markOperatorPing(orderNumber: string, delivered: boolean): Promise<void> {
  if (!isDbConfigured) return;
  try {
    await getDb().execute(sql`
      update orders set
        operator_notified_at = ${delivered ? sql`now()` : sql`null`},
        operator_notify_attempts = operator_notify_attempts + 1
      where number = ${orderNumber}`);
  } catch (err) {
    console.error(`[orders] ping state for ${orderNumber} not saved:`, (err as Error).message);
  }
}

const RETRY_MAX_ATTEMPTS = 6;

/**
 * Orders from the last day whose operator ping did not go through: try again,
 * a few at a time, at most RETRY_MAX_ATTEMPTS each. Called from the worker.
 */
export async function retryOperatorPings(): Promise<{ retried: number; delivered: number }> {
  const rows = (await getDb().execute(sql`
    select number, customer, delivery, payment, items, totals, locale, attribution, source
    from orders
    where operator_notified_at is null and operator_notify_attempts < ${RETRY_MAX_ATTEMPTS}
      and created_at < now() - interval '2 minutes' and created_at > now() - interval '24 hours'
      and number is not null
    order by created_at
    limit 10`)) as unknown as (Pick<OrderRequest, "customer" | "delivery" | "payment" | "items" | "totals" | "locale" | "attribution" | "source"> & { number: string })[];
  let delivered = 0;
  for (const row of rows) {
    const order = { ...row, appliedUpsells: [], appliedPromotions: [] } as unknown as OrderRequest;
    const ok = await notifyOperator(`🔁 Qayta yuborildi (avval yetib bormagan)\n${await operatorOrderText(order, row.number)}`);
    await markOperatorPing(row.number, ok);
    if (ok) delivered += 1;
  }
  return { retried: rows.length, delivered };
}
