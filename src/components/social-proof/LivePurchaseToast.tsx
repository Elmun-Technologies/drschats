"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";

/*
  Sample data. Nobody in this list bought anything — the names exist to show
  the component working, which is why `DeferredUi` only mounts it when
  NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF is on. Replace this array with a real feed of
  recent orders before turning it on anywhere a customer will look.
*/
type L10n = { uz: string; ru: string };
const PURCHASES: { name: L10n; city: L10n; product: string }[] = [
  { name: { uz: "Anvar T.", ru: "Анвар Т." }, city: { uz: "Toshkent", ru: "Ташкент" }, product: "Omega-3 Premium" },
  { name: { uz: "Malika S.", ru: "Малика С." }, city: { uz: "Samarqand", ru: "Самарканд" }, product: "Vitamin D3+K2" },
  { name: { uz: "Bobur N.", ru: "Бобур Н." }, city: { uz: "Fargʻona", ru: "Фергана" }, product: "Magnesium B6" },
  { name: { uz: "Dilnoza R.", ru: "Дилноза Р." }, city: { uz: "Buxoro", ru: "Бухара" }, product: "Vitamin C 1000" },
  { name: { uz: "Jasur K.", ru: "Жасур К." }, city: { uz: "Namangan", ru: "Наманган" }, product: "Omega-3 Premium" },
  { name: { uz: "Nilufar A.", ru: "Нилуфар А." }, city: { uz: "Toshkent", ru: "Ташкент" }, product: "Zinc + Selenium" },
  { name: { uz: "Sardor M.", ru: "Сардор М." }, city: { uz: "Andijon", ru: "Андижан" }, product: "Multivitamin Complex" },
  { name: { uz: "Feruza B.", ru: "Феруза Б." }, city: { uz: "Qoʻqon", ru: "Коканд" }, product: "Vitamin D3+K2" },
  { name: { uz: "Ulugʻbek H.", ru: "Улугбек Х." }, city: { uz: "Toshkent", ru: "Ташкент" }, product: "Omega-3 Premium" },
  { name: { uz: "Zulfiya I.", ru: "Зульфия И." }, city: { uz: "Qarshi", ru: "Карши" }, product: "Magnesium B6" },
];

export function LivePurchaseToast() {
  const t = useTranslations("socialProof");
  const locale = useLocale() as Locale;
  const [current, setCurrent] = useState<(typeof PURCHASES)[0] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // First show after 8s, then every 30–45s
    const show = () => {
      setIndex((i) => {
        const next = (i + 1) % PURCHASES.length;
        setCurrent(PURCHASES[next]);
        return next;
      });
      setTimeout(() => setCurrent(null), 4500);
    };

    const first = setTimeout(show, 8000);
    const interval = setInterval(show, 35000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-4 bottom-[calc(var(--bottom-nav)+1rem)] z-30 max-w-[260px] rounded-2xl border border-line bg-bg px-4 py-3 shadow-buybox"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <p className="text-xs text-ink-2 leading-relaxed">
              <span className="font-semibold text-ink">{current.name[locale]}</span> — {current.city[locale]}
              <br />
              <span className="text-ink">{current.product}</span> {t("bought")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
