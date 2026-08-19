import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer UZS amount as e.g. "189 000 so'm".
 * Grouping is done manually (not via Intl) so the output is identical on the
 * server and in the browser — Intl's ICU thousands-separator can differ between
 * Node and Chromium and break hydration.
 */
export function formatMoney(amount: number, locale: Locale): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const suffix = locale === "ru" ? "сум" : "so’m";
  return `${grouped} ${suffix}`;
}

const MONTHS: Record<Locale, readonly string[]> = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};

/**
 * Format an ISO date as e.g. "2 avgust 2026" / "2 августа 2026".
 *
 * Written out rather than delegated to `Intl.DateTimeFormat` for the same
 * reason as formatMoney: the `uz-UZ` locale has no month names in many ICU
 * builds and renders "2026 M08 2", which is not a date anyone reads. The
 * Russian names are genitive because they follow a day number.
 */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[locale][d.getMonth()]} ${d.getFullYear()}`;
}
