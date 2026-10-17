import type { OrderStatus } from "@/lib/db/schema";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Yangi",
  confirmed: "Tasdiqlangan",
  shipped: "Yoʻlda",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

export function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tashkent" }).format(d);
}

/** Status pill tone. Red stays reserved for discounts, so a cancelled order is muted, not red. */
export const STATUS_TONE: Record<OrderStatus, "dark" | "outline" | "neutral" | "muted"> = {
  new: "dark",
  confirmed: "outline",
  shipped: "neutral",
  delivered: "neutral",
  cancelled: "muted",
};

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeZone: "Asia/Tashkent" }).format(d);
}

export const DELIVERY_LABEL: Record<string, string> = { courier: "Kuryer orqali", pickup: "Oʻzi olib ketadi" };
export const PAYMENT_LABEL: Record<string, string> = { cod: "Naqd pul (yetkazilganda)", online: "Onlayn toʻlov" };
export const LOCALE_LABEL: Record<string, string> = { uz: "Oʻzbekcha", ru: "Ruscha" };

/** The one step forward from each status, offered as the main button on the order. */
export const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "confirmed", label: "Tasdiqlash" },
  confirmed: { status: "shipped", label: "Joʻnatildi" },
  shipped: { status: "delivered", label: "Yetkazildi" },
};
