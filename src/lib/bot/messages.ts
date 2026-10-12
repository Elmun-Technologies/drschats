import type { BotJobPayload, OrderStatus } from "@/lib/db/schema";
import { formatMoney } from "@/lib/utils";

/*
  What the club bot says to a customer. The bot sends with parse_mode HTML,
  so everything from the database is escaped here.
*/

type Locale = "uz" | "ru";

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const STATUS_TEXT: Record<Locale, Record<OrderStatus, string>> = {
  uz: {
    new: "🧾 Buyurtma <b>{n}</b> qabul qilindi · {total}\nOperator tasdiqlash uchun qoʻngʻiroq qiladi.",
    confirmed: "✅ Buyurtma <b>{n}</b> tasdiqlandi va yigʻilmoqda.",
    shipped: "🚚 Buyurtma <b>{n}</b> yoʻlda.",
    delivered: "📬 Buyurtma <b>{n}</b> yetkazildi. Xaridingiz uchun rahmat!",
    cancelled: "Buyurtma <b>{n}</b> bekor qilindi. Savol boʻlsa — shu yerga yozing.",
  },
  ru: {
    new: "🧾 Заказ <b>{n}</b> принят · {total}\nОператор позвонит для подтверждения.",
    confirmed: "✅ Заказ <b>{n}</b> подтверждён и собирается.",
    shipped: "🚚 Заказ <b>{n}</b> в пути.",
    delivered: "📬 Заказ <b>{n}</b> доставлен. Спасибо за покупку!",
    cancelled: "Заказ <b>{n}</b> отменён. Если есть вопросы — напишите сюда.",
  },
};

const STATUS_LABEL: Record<Locale, Record<OrderStatus, string>> = {
  uz: { new: "Qabul qilindi", confirmed: "Tasdiqlandi", shipped: "Yoʻlda", delivered: "Yetkazildi", cancelled: "Bekor qilindi" },
  ru: { new: "Принят", confirmed: "Подтверждён", shipped: "В пути", delivered: "Доставлен", cancelled: "Отменён" },
};

export function statusLabel(status: OrderStatus, locale: Locale): string {
  return STATUS_LABEL[locale][status];
}

const DETAILS: Record<Locale, string> = { uz: "📦 Batafsil", ru: "📦 Подробнее" };

export function orderStatusMessage(
  status: OrderStatus,
  order: { number: string; total: number },
  locale: Locale,
): BotJobPayload {
  const text = STATUS_TEXT[locale][status]
    .replace("{n}", `№${escapeHtml(order.number)}`)
    .replace("{total}", formatMoney(order.total, locale));
  // `ord:` is the bot's own callback for an order card (govita-vip-bot/bot/remote.py).
  return { text, buttons: [[{ text: DETAILS[locale], callback_data: `ord:${order.number}` }]] };
}

export function ticketReplyMessage(reply: string, locale: Locale): BotJobPayload {
  const head = locale === "ru" ? "💬 Ответ оператора GoVita:" : "💬 GoVita operatori javobi:";
  return { text: `${head}\n\n${escapeHtml(reply)}` };
}
