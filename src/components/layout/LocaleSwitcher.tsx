"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchTo(next: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-line-strong"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="uppercase">{locale}</span>
        <svg viewBox="0 0 12 12" className={cn("h-3 w-3 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 z-20 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-line bg-surface-2 py-1 shadow-2xl"
          >
            {locales.map((l) => (
              <li key={l}>
                <button
                  onClick={() => switchTo(l)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-3",
                    l === locale ? "text-accent" : "text-fg",
                  )}
                >
                  {localeNames[l]}
                  <span className="uppercase text-faint">{l}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
