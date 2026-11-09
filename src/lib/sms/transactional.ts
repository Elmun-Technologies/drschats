/*
  Order SMS — the messages a customer gets because they placed an order, not
  because marketing wants them back. Pure: texts, settings shape, and which
  status sends what. The queue and the triggers are in transactional-server.ts.

  The texts are fixed on purpose. Eskiz moderates every SMS template before it
  may be sent; a text an operator could edit in the panel would be refused at
  send time. Change them here, then submit the new wording to Eskiz
  (my.eskiz.uz → SMS → Shablonlar) before deploying. {number}, {phone} are
  filled when queued, {havola} (the signed tracking link) when sent.
*/
import type { MessageLocale } from "@/lib/messaging/template";

export const TRANSACTIONAL_SMS_KEY = "sms.transactional";

export interface TransactionalSmsSettings {
  /** "Order received" right after checkout. */
  orderPlaced: boolean;
  /** Confirmed, on its way, delivered, cancelled — as the operator moves it. */
  statusChanged: boolean;
}

/* Off until someone turns it on: every SMS costs money and the templates need Eskiz approval first. */
export const TRANSACTIONAL_SMS_OFF: TransactionalSmsSettings = { orderPlaced: false, statusChanged: false };

export function parseTransactionalSms(raw: unknown): TransactionalSmsSettings {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return TRANSACTIONAL_SMS_OFF;
    }
  }
  if (!value || typeof value !== "object") return TRANSACTIONAL_SMS_OFF;
  const v = value as Record<string, unknown>;
  return { orderPlaced: v.orderPlaced === true, statusChanged: v.statusChanged === true };
}

export const ORDER_SMS_EVENTS = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderSmsEvent = (typeof ORDER_SMS_EVENTS)[number];

export function isOrderSmsEvent(status: string): status is OrderSmsEvent {
  return (ORDER_SMS_EVENTS as readonly string[]).includes(status);
}

/** Whether this status sends an SMS under these settings. */
export function smsWanted(status: OrderSmsEvent, settings: TransactionalSmsSettings): boolean {
  return status === "new" ? settings.orderPlaced : settings.statusChanged;
}

/** Statuses whose SMS carries the tracking link; after delivery or cancellation there is nothing left to follow. */
export function smsHasLink(status: OrderSmsEvent): boolean {
  return status === "new" || status === "confirmed" || status === "shipped";
}

const TEMPLATES: Record<OrderSmsEvent, Record<MessageLocale, string>> = {
  new: {
    uz: "govita: buyurtma {number} qabul qilindi. Operator ish vaqtida qoʻngʻiroq qilib tasdiqlaydi. Holati: {havola}",
    ru: "govita: заказ {number} принят. Оператор позвонит в рабочее время и подтвердит. Статус: {havola}",
  },
  confirmed: {
    uz: "govita: buyurtma {number} tasdiqlandi va yigʻilmoqda. Holati: {havola}",
    ru: "govita: заказ {number} подтверждён и собирается. Статус: {havola}",
  },
  shipped: {
    uz: "govita: buyurtma {number} yoʻlda. Holati: {havola}",
    ru: "govita: заказ {number} в пути. Статус: {havola}",
  },
  delivered: {
    uz: "govita: buyurtma {number} yetkazildi. Xaridingiz uchun rahmat!",
    ru: "govita: заказ {number} доставлен. Спасибо за покупку!",
  },
  cancelled: {
    uz: "govita: buyurtma {number} bekor qilindi. Savollar boʻlsa: {phone}",
    ru: "govita: заказ {number} отменён. Вопросы: {phone}",
  },
};

/** The queued text: number and phone filled, {havola} left for the outbox. */
export function orderSmsText(status: OrderSmsEvent, vars: { number: string; phone: string }, locale: MessageLocale): string {
  return TEMPLATES[status][locale].replace("{number}", vars.number).replace("{phone}", vars.phone);
}

/** Every template, for the admin screen (what to submit to Eskiz). */
export function orderSmsTemplates(): { status: OrderSmsEvent; uz: string; ru: string }[] {
  return ORDER_SMS_EVENTS.map((status) => ({ status, ...TEMPLATES[status] }));
}
