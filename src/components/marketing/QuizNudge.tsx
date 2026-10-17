"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCommerce } from "@/lib/commerce/context";
import { localizedOr } from "@/lib/commerce/settings";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { loadQuiz } from "@/lib/quiz/engine";
import { isQuietPath, usePopups } from "@/lib/ui/popups";

/*
  A small corner card, not a modal: after a visitor has looked at a few pages
  without finding their way, it offers the quiz. Never for someone who has
  already taken it, never on the order pages.
*/
const PAGES_BEFORE_NUDGE = 3;
const VIEWS_KEY = "govita-pageviews";

export function QuizNudge() {
  const t = useTranslations("popups.quiz");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const rule = useCommerce().popups.quiz;
  const open = usePopups((s) => s.active === "quiz");
  const close = usePopups((s) => s.close);

  useEffect(() => {
    // Navigating to the order pages takes an open card away with it.
    if (isQuietPath(pathname)) {
      if (usePopups.getState().active === "quiz") usePopups.getState().close();
      return;
    }
    if (!rule.enabled || loadQuiz()) return;
    let views = 0;
    try {
      views = Number(sessionStorage.getItem(VIEWS_KEY) ?? 0) + 1;
      sessionStorage.setItem(VIEWS_KEY, String(views));
    } catch {
      return;
    }
    if (views < PAGES_BEFORE_NUDGE) return;
    const timer = window.setTimeout(() => usePopups.getState().request("quiz", rule), rule.delaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [pathname, rule]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          aria-labelledby="quiz-nudge-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-[calc(var(--bottom-nav)+1rem)] z-[65] mx-auto max-w-[380px] rounded-[20px] bg-dark-panel p-5 text-white shadow-pop sm:left-auto sm:right-6 sm:mx-0"
        >
          <button
            type="button"
            onClick={close}
            aria-label={tc("close")}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-on-dark-2 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <p id="quiz-nudge-title" className="pr-10 text-lg font-bold leading-6">{localizedOr(rule.title, locale, t("title"))}</p>
          <p className="mt-1.5 text-sm leading-5 text-on-dark-2">{localizedOr(rule.body, locale, t("body"))}</p>
          <Link
            href="/quiz"
            onClick={close}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-sm bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-tile"
          >
            {t("cta")}
          </Link>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
