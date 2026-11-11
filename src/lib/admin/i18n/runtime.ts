import { cache } from "react";
import { DEFAULT_ADMIN_LOCALE, translate, type AdminLocale, type Vars } from "./shared";

/*
  The per-request language, readable from plain helpers (som() and friends)
  as well as from server.ts. On the server React's cache() keeps one value per
  request; in a client bundle cache() does not memoise, so a helper that runs
  there simply answers in Uzbek — client components use useT() for text.
*/
const requestLocale = cache((): { locale: AdminLocale } => ({ locale: DEFAULT_ADMIN_LOCALE }));

export function setRequestAdminLocale(locale: AdminLocale): void {
  requestLocale().locale = locale;
}

export function requestAdminLocale(): AdminLocale {
  return requestLocale().locale;
}

export function tr(uz: string, vars?: Vars): string {
  return translate(requestLocale().locale, uz, vars);
}
