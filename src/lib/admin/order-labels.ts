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
