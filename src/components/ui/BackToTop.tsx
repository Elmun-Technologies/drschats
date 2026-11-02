"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
 * A 44px circle (the tap-target floor). Hidden with `invisible`, not
 * unmounted, so the fade is a plain CSS transition and the button is out of
 * the tab order while it cannot be seen. It sits above the mobile tab bar
 * through the shared `--bottom-nav` token rather than a hand-picked offset.
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
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
      }
      aria-label={t("backToTop")}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      data-miniapp-hide
      className={cn(
        "fixed right-3 bottom-[calc(var(--bottom-nav)+0.75rem)] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-bg/90 text-ink shadow-md backdrop-blur-sm transition-[opacity,transform,visibility] duration-200 hover:text-ink",
        show ? "visible scale-100 opacity-100" : "invisible scale-75 opacity-0",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
