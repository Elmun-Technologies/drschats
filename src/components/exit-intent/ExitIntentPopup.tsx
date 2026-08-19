"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics/events";

export function ExitIntentPopup() {
  const t = useTranslations("exit");
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("exit-shown")) return;

    let triggered = false;

    function handleMouseLeave(e: MouseEvent) {
      if (triggered || e.clientY > 10) return;
      triggered = true;
      sessionStorage.setItem("exit-shown", "1");
      setTimeout(() => setIsOpen(true), 100);
    }

    function handleVisibilityChange() {
      if (triggered || document.visibilityState !== "hidden") return;
      triggered = true;
      sessionStorage.setItem("exit-shown", "1");
    }

    // Wait 5s before enabling to avoid triggering on accidental movement
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 7) return;
    track("exit_intent_lead", { phone });
    setSubmitted(true);
    setTimeout(() => setIsOpen(false), 2000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-4 bottom-6 z-[71] mx-auto max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-faint hover:text-fg"
              aria-label={t("dismiss")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            {submitted ? (
              <div className="py-4 text-center">
                <p className="text-2xl">✅</p>
                <p className="mt-2 font-semibold text-accent">{t("successMessage")}</p>
              </div>
            ) : (
              <>
                <p className="text-xl">🎁</p>
                <h3 className="mt-2 font-display text-lg font-bold">{t("title")}</h3>
                <p className="mt-1 text-sm text-muted">{t("body")}</p>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                    inputMode="tel"
                    className="flex-1 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-strong"
                  >
                    {t("cta")}
                  </button>
                </form>
                <button onClick={() => setIsOpen(false)} className="mt-3 w-full text-center text-xs text-faint hover:text-muted">
                  {t("dismiss")}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
