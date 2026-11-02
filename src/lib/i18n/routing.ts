import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "uz"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  uz: "Oʻzbekcha",
};

/** BCP-47 tags for <html lang> and hreflang alternates. */
export const localeHtmlLang: Record<Locale, string> = {
  ru: "ru-RU",
  uz: "uz-UZ",
};

/*
  localeDetection off: `/` answers with one permanent 308 to `/uz`
  (next.config.ts), the same for every visitor and crawler, instead of a 307
  chosen per Accept-Language/cookie. alternateLinks off: the hreflang set is
  written in the HTML by buildAlternates; next-intl's own `Link:` header
  listed a different set and contradicted it.
*/
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
  alternateLinks: false,
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
