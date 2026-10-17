import { escapeHtml } from "@/lib/bot/messages";

/*
  The club bot's loyalty lines (HTML, parse_mode HTML), appended to an
  order's status message. Each says only what is true at that moment:
  "will be credited" before delivery, "credited" after.
*/

type L = "uz" | "ru";
const n = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function earnLaterLine(points: number, locale: L): string {
  return locale === "ru"
    ? `💎 После доставки на ваш счёт поступит ${n(points)} баллов.`
    : `💎 Hisobingizga ${n(points)} ball tushadi (yetkazilgach).`;
}

export function earnedLine(points: number, balance: number, locale: L): string {
  return locale === "ru"
    ? `💎 На ваш счёт начислено ${n(points)} баллов. Баланс: ${n(balance)}.`
    : `💎 Hisobingizga ${n(points)} ball tushdi. Balans: ${n(balance)} ball.`;
}

export function spentLine(points: number, locale: L): string {
  return locale === "ru" ? `💎 Оплачено баллами: ${n(points)}.` : `💎 Ball bilan toʻlandi: ${n(points)}.`;
}

export function refundLine(points: number, locale: L): string {
  return locale === "ru" ? `💎 ${n(points)} баллов возвращены на ваш счёт.` : `💎 ${n(points)} ball hisobingizga qaytarildi.`;
}

export function referralLine(code: string, percent: number, locale: L): string {
  const c = `<b>${escapeHtml(code)}</b>`;
  return locale === "ru"
    ? `🤝 Поделитесь с другом: код ${c} — скидка −${percent}% на его первый заказ.`
    : `🤝 Doʻstingizga ulashing: ${c} kodi — birinchi buyurtmasiga −${percent}% chegirma.`;
}

export function joinLines(...parts: ({ uz: string; ru: string } | null)[]): { uz: string; ru: string } | null {
  const live = parts.filter((p): p is { uz: string; ru: string } => p !== null);
  if (live.length === 0) return null;
  return { uz: live.map((p) => p.uz).join("\n"), ru: live.map((p) => p.ru).join("\n") };
}

export function both(line: (locale: L) => string): { uz: string; ru: string } {
  return { uz: line("uz"), ru: line("ru") };
}
