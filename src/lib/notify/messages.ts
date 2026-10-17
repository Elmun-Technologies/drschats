import type { WaitKind } from "@/lib/db/schema";
import { formatMoney } from "@/lib/utils";
import type { WaitMessage } from "./types";

/*
  What a waiting customer is told, in their language. Plain text: the same
  words go to Telegram (escaped there for the bot's HTML mode), to SMS in the
  next phase and into the operator's call list. Facts only — the product, its
  real price and a link; no "hurry", no invented scarcity.
*/

type Locale = "uz" | "ru";

const TEXT: Record<Locale, Record<WaitKind, string>> = {
  uz: {
    restock: "🔔 «{name}» yana sotuvda.\nNarxi: {price}\n\nBuyurtma berish: {url}",
    price_drop: "📉 «{name}» narxi tushdi: {before} → {price}\n\nBuyurtma berish: {url}",
  },
  ru: {
    restock: "🔔 «{name}» снова в продаже.\nЦена: {price}\n\nЗаказать: {url}",
    price_drop: "📉 Цена на «{name}» снизилась: {before} → {price}\n\nЗаказать: {url}",
  },
};

export const OPEN_PRODUCT: Record<Locale, string> = { uz: "Mahsulotni ochish", ru: "Открыть товар" };

export function waitlistText(m: Pick<WaitMessage, "kind" | "locale" | "productName" | "price" | "before" | "url">): string {
  return TEXT[m.locale][m.kind]
    .replace("{name}", m.productName)
    .replace("{price}", formatMoney(m.price, m.locale))
    .replace("{before}", formatMoney(m.before ?? m.price, m.locale))
    .replace("{url}", m.url);
}

/** The product page, tagged so a sale from the message shows up under its channel. */
export function waitlistUrl(origin: string, locale: Locale, slug: string, kind: WaitKind, source: "telegram" | "sms" | "operator"): string {
  const params = new URLSearchParams({ utm_source: source, utm_medium: "restock", utm_campaign: kind });
  return `${origin.replace(/\/$/, "")}/${locale}/product/${encodeURIComponent(slug)}?${params.toString()}`;
}

/** The operator's call list for one product: whoever no customer channel reached. */
export function operatorCallList(messages: WaitMessage[]): string {
  const first = messages[0];
  if (!first) return "";
  const head =
    first.kind === "price_drop"
      ? `📉 Narxi tushdi: ${first.productName} (${formatMoney(first.before ?? first.price, "uz")} → ${formatMoney(first.price, "uz")})`
      : `🔔 Kutilgan mahsulot sotuvda: ${first.productName}`;
  const lines = messages.map((m) => `📞 +${m.phone.replace(/^\+/, "")} (${m.locale})`);
  return [head, "Telegram orqali xabar berib boʻlmadi — qoʻngʻiroq qiling:", ...lines, "", first.url.replace(/utm_source=[^&]+/, "utm_source=operator")].join("\n");
}
