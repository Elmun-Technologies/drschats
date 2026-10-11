"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { COMMERCE } from "@/lib/config/commerce";
import { isQuietPath, usePopups } from "@/lib/ui/popups";
import { buttonVariants } from "@/components/ui/Button";
import { PopupShell } from "./PopupShell";

/*
  The first-visit card. It states the shop's standing first-order discount
  (COMMERCE.discounts.firstOrderPercent — the same figure the loyalty page and
  the operator's order message use), so it promises nothing the shop does not
  already honour. Shown once a visitor has engaged: 20 seconds on a page or
  half of it scrolled, never on the order pages.
*/
const DELAY_MS = 20_000;

export function WelcomeOffer() {
  const t = useTranslations("popups.welcome");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const active = usePopups((s) => s.active === "welcome");
  const close = usePopups((s) => s.close);

  useEffect(() => {
    if (isQuietPath(pathname)) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      usePopups.getState().request("welcome");
    };
    const timer = window.setTimeout(fire, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    <PopupShell open={active} onClose={close} labelledBy="welcome-title" closeLabel={tc("close")}>
      <span className="inline-flex rounded-full bg-red px-3 py-1 text-sm font-bold text-white">
        −{COMMERCE.discounts.firstOrderPercent}%
      </span>
      <h2 id="welcome-title" className="mt-4 pr-8 text-[26px] font-bold leading-8">
        {t("title", { percent: COMMERCE.discounts.firstOrderPercent })}
      </h2>
      <p className="mt-2 text-base leading-6 text-ink-2">{t("body")}</p>
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
