import "server-only";

import { notifyOperator } from "@/lib/notifications/operator";
import { ordersFromPhone } from "@/lib/catalog/db";
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
    if (adjustment?.kind !== "first_order") lines.push("🎁 Yangi mijoz");
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
      `📍 ${order.delivery.region}, ${order.delivery.address}`,
      `🚚 ${order.delivery.method}`,
      order.payment
        ? `💳 ${order.payment.method === "online" ? `Onlayn to'lov: ${order.payment.provider}` : "Yetkazishda to'lov"}`
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

export async function notifyOperatorOfOrder(order: OrderRequest, orderId: string): Promise<boolean> {
  return notifyOperator(await operatorOrderText(order, orderId));
}
