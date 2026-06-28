import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "uz"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  uz: "O’zbekcha",
};

/** BCP-47 tags for <html lang> and hreflang alternates. */
export const localeHtmlLang: Record<Locale, string> = {
  ru: "ru-RU",
  uz: "uz-UZ",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
