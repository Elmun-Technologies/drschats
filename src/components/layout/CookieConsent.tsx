"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useConsent, writeConsent } from "@/lib/analytics/consent";

/*
  One compact bar with two equal answers. Nothing that measures the visit
  (analytics tags, the first-party journey) runs until «Qabul qilish»
  (lib/analytics/consent.ts); «Rad etish» is remembered just the same, so
  the bar does not return on every page.
*/
export function CookieConsent() {
  const t = useTranslations("cookie");
  const consent = useConsent();

  if (consent !== null) return null;

  return (
    <div
      data-miniapp-hide
      data-cookie-bar
      role="region"
      aria-label={t("label")}
      className="fixed inset-x-3 bottom-[calc(var(--bottom-nav)+0.75rem)] z-50 mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-bg px-4 py-3 shadow-pop"
    >
      <p className="min-w-0 flex-1 basis-[220px] text-[13px] leading-[18px] text-ink-2">
        {t("text")}{" "}
        <Link href="/privacy" className="text-ink underline">
          {t("more")}
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink transition-colors hover:bg-tile"
        >
          {t("reject")}
        </button>
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-black hover:text-white"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
