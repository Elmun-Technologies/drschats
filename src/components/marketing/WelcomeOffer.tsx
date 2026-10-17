"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCommerce } from "@/lib/commerce/context";
import { localizedOr } from "@/lib/commerce/settings";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { isQuietPath, usePopups } from "@/lib/ui/popups";
import { buttonVariants } from "@/components/ui/Button";
import { PopupShell } from "./PopupShell";
import type { FirstOrderOffer } from "@/lib/promo/rules";

/*
  The first-visit card. It states the shop's first-order discount as this
  deployment honours it (lib/promo/offer.ts): applied automatically at
  checkout when orders are in our database, by the operator otherwise — and
  is not shown at all when the discount is switched off in the admin panel. Shown once a visitor has engaged: 20 seconds on a page or
  half of it scrolled, never on the order pages. The delay, the cool-down,
  the switch and the optional title/body are the admin's (/admin/commerce).
*/

export function WelcomeOffer({ offer }: { offer: FirstOrderOffer }) {
  const t = useTranslations("popups.welcome");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const rule = useCommerce().popups.welcome;
  const active = usePopups((s) => s.active === "welcome");
  const close = usePopups((s) => s.close);

  useEffect(() => {
    if (!rule.enabled || isQuietPath(pathname)) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      usePopups.getState().request("welcome", rule);
    };
    const timer = window.setTimeout(fire, rule.delaySeconds * 1000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, rule]);

  return (
    <PopupShell open={active} onClose={close} labelledBy="welcome-title" closeLabel={tc("close")}>
      <span className="inline-flex rounded-full bg-red px-3 py-1 text-sm font-bold text-white">
        −{offer.percent}%
      </span>
      <h2 id="welcome-title" className="mt-4 pr-8 text-[26px] font-bold leading-8">
        {localizedOr(rule.title, locale, t("title", { percent: offer.percent })).replaceAll("{percent}", String(offer.percent))}
      </h2>
      <p className="mt-2 text-base leading-6 text-ink-2">
        {localizedOr(rule.body, locale, offer.mode === "auto" ? t("bodyAuto") : t("body")).replaceAll("{percent}", String(offer.percent))}
      </p>
      <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
        {(["perk1", "perk2", "perk3"] as const).map((k) => (
          <li key={k} className="flex gap-2.5">
            <span aria-hidden className="mt-0.5 font-bold text-ink">✓</span>
            {t(k)}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2">
        <Link href="/products" onClick={close} className={buttonVariants("primary", "lg") + " w-full"}>
          {t("cta")}
        </Link>
        <Link href="/quiz" onClick={close} className={buttonVariants("light", "lg") + " w-full"}>
          {t("quiz")}
        </Link>
      </div>
      <p className="mt-3 text-center text-[13px] text-muted">{t("note")}</p>
    </PopupShell>
  );
}
