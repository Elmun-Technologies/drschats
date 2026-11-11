"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_LANG_COOKIE, ADMIN_LOCALES, DEFAULT_ADMIN_LOCALE, translate, type AdminLocale, type Vars } from "./shared";

const LocaleContext = createContext<AdminLocale>(DEFAULT_ADMIN_LOCALE);

/** The panel layout reads the cookie on the server and hands the language to every client component. */
export function AdminLocaleProvider({ locale, children }: { locale: AdminLocale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useAdminLocale(): AdminLocale {
  return useContext(LocaleContext);
}

export function useT(): (uz: string, vars?: Vars) => string {
  const locale = useContext(LocaleContext);
  return useCallback((uz: string, vars?: Vars) => translate(locale, uz, vars), [locale]);
}

const NAME: Record<AdminLocale, string> = { uz: "UZ", ru: "RU" };

/* Sets the cookie in the browser and re-renders the page: no server action, so the switch needs no permission of its own. */
export function AdminLangSwitch({ className }: { className?: string }) {
  const locale = useAdminLocale();
  const router = useRouter();
  const t = useT();
  function choose(next: AdminLocale) {
    if (next === locale) return;
    document.cookie = `${ADMIN_LANG_COOKIE}=${next}; path=/admin; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div role="group" aria-label={t("Til")} className={className ?? "flex items-center gap-1 rounded-[12px] bg-tile p-1"}>
      {ADMIN_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={code === locale}
          onClick={() => choose(code)}
          className={`h-9 min-w-[44px] rounded-[9px] px-2 text-[13px] font-semibold transition-colors ${code === locale ? "bg-ink text-white" : "text-ink-2 hover:bg-tile-hover"}`}
        >
          {NAME[code]}
        </button>
      ))}
    </div>
  );
}
