import "server-only";

import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, DEFAULT_ADMIN_LOCALE, isAdminLocale, type AdminLocale, type Vars } from "./shared";
import { requestAdminLocale, setRequestAdminLocale, tr } from "./runtime";

/*
  The language of the request being rendered. requireAdmin() — the first await
  of every admin page and action — calls initAdminLocale(), so by the time a
  component reads t("…") the cookie has been read. React's cache() keeps one
  value per request, so two admins on different languages never see each
  other's. Before the init (a module-level constant, say) t() answers in Uzbek.
*/

export async function readAdminLocale(): Promise<AdminLocale> {
  try {
    const value = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
    return isAdminLocale(value) ? value : DEFAULT_ADMIN_LOCALE;
  } catch {
    return DEFAULT_ADMIN_LOCALE;
  }
}

export async function initAdminLocale(): Promise<AdminLocale> {
  const locale = await readAdminLocale();
  setRequestAdminLocale(locale);
  return locale;
}

export function adminLocale(): AdminLocale {
  return requestAdminLocale();
}

/** The Uzbek text, or its Russian entry when the request is in Russian. */
export function t(uz: string, vars?: Vars): string {
  return tr(uz, vars);
}

/** For `export const metadata`: the tab title in the admin's language. */
export async function adminTitle(uz: string): Promise<{ title: string }> {
  await initAdminLocale();
  return { title: t(uz) };
}

/**
 * A label table written in Uzbek whose values are read per request:
 * `STATUS_LABEL[status]` answers in the language of the request that reads it,
 * not of the one that first imported the module.
 */
export function labels<T extends object>(table: T): T {
  return new Proxy(table, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === "string" ? t(value) : value;
    },
  });
}
