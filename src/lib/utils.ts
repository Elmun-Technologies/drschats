import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/routing";

/*
  The V3 type scale (globals.css `--text-*`) as a font-size group. Unknown
  `text-*` names default to colours in tailwind-merge, so without this
  `cn("text-caption", "text-muted")` silently dropped the size.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["h-hero", "h-page", "h-section", "title", "lead", "body", "card-title", "caption", "price", "price-l", "button"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Group digits with a space: 79000 → "79 000". */
export function formatNumber(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Format an integer UZS amount as e.g. "189 000 soʻm" (U+02BB, the Uzbek
 * okina — the design rule for every oʻ/gʻ/soʻm on the site).
 * Grouping is done manually (not via Intl) so the output is identical on the
 * server and in the browser — Intl's ICU thousands-separator can differ between
 * Node and Chromium and break hydration.
 */
export function formatMoney(amount: number, locale: Locale): string {
  return `${formatNumber(amount)} ${locale === "ru" ? "сум" : "soʻm"}`;
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
