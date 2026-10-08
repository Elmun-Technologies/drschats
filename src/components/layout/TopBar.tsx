"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ICONS } from "./header-item";

/* Utility row above the desktop header (design: HeaderV3, first row). */
export function TopBar() {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const links = [
    { href: "/delivery", label: nav("menu.delivery") },
    { href: "/payment", label: nav("payment") },
    { href: "/guarantee", label: t("guarantee") },
    { href: "/loyalty", label: t("loyalty") },
    { href: "/partners", label: t("forPharmacies") },
  ];
  return (
    <div className="wrap flex h-10 items-center gap-6 text-sm text-ink-2">
      <Link href="/contact" className="inline-flex items-center gap-1.5 font-semibold text-ink">
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS.pin} />
        </svg>
        {t("city")}
      </Link>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="hover:text-ink">
          {l.label}
        </Link>
      ))}
      <span className="flex-1" />
      <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
        Telegram
      </a>
      <a href={`tel:${BRAND.contact.phoneHref}`} className="font-bold text-ink">
        {BRAND.contact.phone}
      </a>
      <LocaleLinks />
    </div>
  );
}

const LOCALE_ORDER: readonly Locale[] = ["uz", "ru"];

/** "UZ | RU" — both locales as plain links to the same page. */
export function LocaleLinks() {
  const current = useLocale() as Locale;
  const pathname = usePathname();
  return (
    <span className="inline-flex items-center gap-2 font-semibold">
      {LOCALE_ORDER.map((l, i) => (
        <span key={l} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-on-dark-2">|</span>}
          <Link
            href={pathname}
            locale={l}
            aria-current={l === current ? "true" : undefined}
            className={cn("uppercase", l === current ? "text-ink" : "text-ink-2 hover:text-ink")}
          >
            {l}
          </Link>
        </span>
      ))}
    </span>
  );
}
