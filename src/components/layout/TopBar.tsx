"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ICONS } from "./header-item";
import type { StoreAnnouncement } from "@/lib/merch/model";
import { AnnouncementBar } from "@/components/marketing/AnnouncementBar";

/*
  Utility row above the desktop header (design: HeaderV3, first row). When
  the team runs announcements (admin → Vitrina → Eʼlon qatori) they take the
  middle of the row instead of the info links; city, Telegram, phone and the
  language switch stay.
*/
export function TopBar({ announcements = [] }: { announcements?: StoreAnnouncement[] }) {
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
    <div className="wrap flex h-10 items-center gap-4 whitespace-nowrap text-sm text-ink-2 xl:gap-6">
      <Link href="/contact" className="inline-flex items-center gap-1.5 font-semibold text-ink">
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS.pin} />
        </svg>
        {t("city")}
      </Link>
      {announcements.length > 0 ? (
        <AnnouncementBar items={announcements} variant="desktop" />
      ) : (
        <>
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} className={cn("hover:text-ink", i >= 3 && "max-xl:hidden")}>
              {l.label}
            </Link>
          ))}
          <span className="flex-1" />
        </>
      )}
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
