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
  const suffix = locale === "ru" ? "сум" : locale === "en" ? "UZS" : "so‘m";
  return `${grouped} ${suffix}`;
}
