"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * Threshold, in pixels of scroll, before the button appears.
 *
 * It used to be 700, which on a phone is roughly one product card — so the
 * button was already sitting on the price column, the add-to-cart button and
 * the delivery warning by the time a shopper had read one screen. Two screens
 * is the point where "take me back" is a real request rather than a decoration
 * that covers the thing being read.
 */
const SHOW_AFTER_PX = 1400;

/**
 * A 36px circle, not the old 44px one.
 *
 * The tap target stays comfortable because the button keeps its own padding —
 * the icon inside is what shrank. It sits above the mobile tab bar through the
 * shared `--bottom-nav` token rather than a hand-picked offset.
 */
export function BackToTop() {
  const t = useTranslations("common");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("backToTop")}
          className="fixed right-3 bottom-[calc(var(--bottom-nav)+0.75rem)] z-30 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-bg/90 text-ink shadow-md backdrop-blur-sm transition-colors hover:border-line-strong hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
