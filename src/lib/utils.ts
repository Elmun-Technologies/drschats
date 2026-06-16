import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const localeTag: Record<Locale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/** Format an integer UZS amount as e.g. "189 000 so'm". */
export function formatMoney(amount: number, locale: Locale): string {
  const grouped = new Intl.NumberFormat(localeTag[locale], {
    maximumFractionDigits: 0,
  }).format(amount);
  const suffix = locale === "ru" ? "сум" : locale === "en" ? "UZS" : "so‘m";
  return `${grouped} ${suffix}`;
}
