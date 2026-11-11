import { RU } from "./dict-ru";

/*
  Admin panel languages. The panel's source language is Uzbek: every label is
  written once, in Uzbek, as the argument of t("…"), and the Russian text is
  looked up by that exact string in dict-ru.ts. A string with no Russian entry
  shows in Uzbek, so a missing translation never breaks a page — i18n.test.ts
  lists the ones still missing.
*/

export const ADMIN_LOCALES = ["uz", "ru"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];
export const ADMIN_LANG_COOKIE = "gv_admin_lang";
export const DEFAULT_ADMIN_LOCALE: AdminLocale = "uz";

export function isAdminLocale(value: unknown): value is AdminLocale {
  return typeof value === "string" && (ADMIN_LOCALES as readonly string[]).includes(value);
}

export type Vars = Record<string, string | number>;

function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => (key in vars ? String(vars[key]) : whole));
}

/** `{name}` placeholders are filled in after the lookup, so the Uzbek text is the key whatever the values. */
export function translate(locale: AdminLocale, uz: string, vars?: Vars): string {
  const text = locale === "ru" ? (RU[uz] ?? uz) : uz;
  return fill(text, vars);
}
