"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/brand";
import { usePathname } from "@/lib/i18n/navigation";
import { useDialog } from "@/lib/ui/useDialog";

/*
  The leaving-visitor card.

  It used to promise "50,000 so'm voucher + free doctor consultation", gate it
  behind a phone number, and then do nothing with the number except hand it to
  the analytics tracker. A shop that never sends the voucher and never calls
  has taught the visitor that its other promises are worth the same.

  What is left is the one thing we can actually deliver at the moment somebody
  is about to close the tab: the Telegram channel, where order status, intake
  reminders and club offers already live. No phone field, no countdown, no
  "only today".
*/
export function ExitIntentPopup() {
  const t = useTranslations("exit");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  // Never in the middle of an order: a full-screen card over the order form
  // costs more orders than the channel link wins.
  const checkingOut = pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  const dialogRef = useDialog<HTMLDivElement>(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (checkingOut || sessionStorage.getItem("exit-shown")) return;

    let triggered = false;

    function handleMouseLeave(e: MouseEvent) {
      if (triggered || e.clientY > 10) return;
      triggered = true;
      sessionStorage.setItem("exit-shown", "1");
      setTimeout(() => setIsOpen(true), 100);
    }

    // Only the explicit "cursor aimed at the close button / top edge" gesture.
    // A tab switch (visibilitychange) is a background event, not an intent to
    // leave — firing a full-screen offer on it reads as telepathic nagging.
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 4000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [checkingOut]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-md -translate-y-1/2 overflow-hidden rounded-3xl border border-line bg-bg p-7 shadow-pop sm:p-8"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-tile p-2 text-ink-2 transition-colors hover:text-ink"
              aria-label={t("dismiss")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <p className="text-xs font-bold uppercase tracking-widest text-ink">{t("badge")}</p>

            <h2 id="exit-title" className="mt-3 text-2xl font-extrabold leading-tight text-ink">{t("title")}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-ink-2">{t("body")}</p>

            <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-line bg-bg p-4 text-sm text-ink">
              {[t("perk1"), t("perk2"), t("perk3")].map((perk) => (
                <li key={perk} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-tile text-[10px] font-bold text-ink">
                    ✓
                  </span>
                  <span className="leading-snug">{perk}</span>
                </li>
              ))}
            </ul>

            <a
              href={BRAND.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-ink/90"
            >
              {t("cta")}
            </a>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-2">{t("promise")}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
