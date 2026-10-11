"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BRAND } from "@/lib/brand";
import type { Locale } from "@/lib/i18n/routing";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals } from "@/lib/cart/pricing";
import { isQuietPath, usePopups } from "@/lib/ui/popups";
import { formatMoney } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { PopupShell } from "@/components/marketing/PopupShell";

/*
  The leaving-visitor card, on desktop (the pointer heading for the tab bar).

  With something in the cart it is a reminder of that cart — the products and
  the total, one click from the order form. With an empty cart it offers the
  one channel the shop can actually deliver on: Telegram (order status,
  intake reminders, club offers). No invented voucher, no countdown, no phone
  field. Never on the order pages themselves; one marketing popup per visit
  (lib/ui/popups.ts).
*/
export function ExitIntentPopup() {
  const t = useTranslations("exit");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const promotions = usePromotions();
  const open = usePopups((s) => s.active === "exit");
  const close = usePopups((s) => s.close);

  useEffect(() => {
    if (isQuietPath(pathname)) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) usePopups.getState().request("exit");
    };
    // Not in the first seconds: a pointer passing the tab bar on arrival is not leaving.
    const timer = window.setTimeout(() => document.addEventListener("mouseleave", onLeave), 4000);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [pathname]);

  const totals = computeTotals(lines, promotions);
  const hasCart = lines.length > 0;

  return (
    <PopupShell open={open} onClose={close} labelledBy="exit-title" closeLabel={t("dismiss")}>
      {hasCart ? (
        <>
          <h2 id="exit-title" className="pr-8 text-[26px] font-bold leading-8">
            {t("cartTitle", { count: totals.itemCount })}
          </h2>
          <p className="mt-2 text-base leading-6 text-ink-2">{t("cartBody")}</p>
          <ul className="mt-4 flex flex-col divide-y divide-line rounded-[16px] bg-tile px-4">
            {lines.slice(0, 3).map((l) => (
              <li key={l.lineId} className="flex justify-between gap-3 py-2.5 text-[15px]">
                <span className="line-clamp-1">{l.name}</span>
                <span className="shrink-0 text-ink-2">× {l.quantity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between text-base font-bold">
            <span>{t("cartTotal")}</span>
            <span>{formatMoney(totals.total, locale)}</span>
          </p>
          {totals.freeShippingRemaining > 0 && (
            <p className="mt-1 text-sm text-ink-2">
              {t("cartFreeShipping", { amount: formatMoney(totals.freeShippingRemaining, locale) })}
            </p>
          )}
          <Link href="/cart" onClick={close} className={buttonVariants("primary", "lg") + " mt-5 w-full"}>
            {t("cartCta")}
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm font-bold uppercase tracking-widest text-ink-2">{t("badge")}</p>
          <h2 id="exit-title" className="mt-3 pr-8 text-[26px] font-bold leading-8">{t("title")}</h2>
          <p className="mt-2 text-base leading-6 text-ink-2">{t("body")}</p>
          <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
            {[t("perk1"), t("perk2"), t("perk3")].map((perk) => (
              <li key={perk} className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 font-bold text-ink">✓</span>
                {perk}
              </li>
            ))}
          </ul>
          <a
            href={BRAND.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className={buttonVariants("primary", "lg") + " mt-5 w-full"}
          >
            {t("cta")}
          </a>
          <p className="mt-3 text-center text-[13px] text-muted">{t("promise")}</p>
        </>
      )}
    </PopupShell>
  );
}
