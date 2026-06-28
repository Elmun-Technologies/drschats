"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

const PURCHASES = [
  { name: "Anvar T.", city: "Toshkent", product: "Omega-3 Premium" },
  { name: "Malika S.", city: "Samarqand", product: "Vitamin D3+K2" },
  { name: "Bobur N.", city: "Farg'ona", product: "Magnesium B6" },
  { name: "Dilnoza R.", city: "Buxoro", product: "Vitamin C 1000" },
  { name: "Jasur K.", city: "Namangan", product: "Omega-3 Premium" },
  { name: "Nilufar A.", city: "Toshkent", product: "Zinc + Selenium" },
  { name: "Sardor M.", city: "Andijon", product: "Multivitamin Complex" },
  { name: "Feruza B.", city: "Qo'qon", product: "Vitamin D3+K2" },
  { name: "Ulugbek H.", city: "Toshkent", product: "Omega-3 Premium" },
  { name: "Zulfiya I.", city: "Qarshi", product: "Magnesium B6" },
];

export function LivePurchaseToast() {
  const t = useTranslations("socialProof");
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
          className="fixed bottom-20 left-4 z-30 max-w-[260px] rounded-2xl border border-line bg-surface px-4 py-3 shadow-xl md:bottom-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-semibold text-fg">{current.name}</span> — {current.city}
              <br />
              <span className="text-accent">{current.product}</span> {t("bought")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
