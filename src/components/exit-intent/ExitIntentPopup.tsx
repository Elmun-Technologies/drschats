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

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }, 4000);

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
    setTimeout(() => setIsOpen(false), 3000);
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
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] mx-auto max-w-lg overflow-hidden rounded-[2.5rem] border border-gold/40 bg-gradient-to-br from-brand-deep via-brand-deep to-accent p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.8)] text-white"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label={t("dismiss")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold text-3xl mx-auto mb-4 border border-gold/40">
                  🎁
                </span>
                <h3 className="font-display text-2xl font-extrabold text-white">Promo-kod taqdim etildi!</h3>
                <p className="mt-2 text-sm text-surface-2/80">
                  Sizga SMS orqali 50,000 so&apos;mlik promo-kod va shifokor konsultatsiyasi havolasi yuborildi.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-deep shadow-md">
                    🎁 MAXSUS SOVGA
                  </span>
                  <span className="text-xs text-gold font-bold">Faqat bugun</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow-md">
                  50,000 so&apos;m Vafdorlik Vaucheri & Bepul Vrach Konsultatsiyasi!
                </h3>
                
                <p className="mt-3 text-sm text-surface-2/90 leading-relaxed">
                  Ketishdan oldin telefon raqamingizni kiriting — biz sizga darhol 50,000 so&apos;mlik birinchi xarid promo-kodini hamda vrach-nutriologning bepul shaxsiy tavsiyasini yuboramiz.
                </p>

                <div className="mt-5 rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                  <ul className="flex flex-col gap-2 text-xs font-semibold text-white/90">
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold">✓</span> Birinchi buyurtmaga 50,000 so&apos;m promo-kod
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold">✓</span> Bepul vrach-nutriolog konsultatsiyasi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold">✓</span> Yopiq aksiyalar va VIP chegirmalar
                    </li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    inputMode="tel"
                    className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white placeholder-white/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-gold px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-xl shadow-gold/20 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 shrink-0"
                  >
                    Vaucherni olish ➔
                  </button>
                </form>

                <p className="mt-3 text-center text-[11px] text-white/50">
                  * 100% maxfiylik kafolatlanadi. Reklama yoki spam yuborilmaydi.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
