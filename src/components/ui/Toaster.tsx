"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/ui/toast";
import { useCart } from "@/lib/cart/store";

export function Toaster() {
  const t = useTranslations("common");
  const toasts = useToast((s) => s.toasts);
  const openCart = useCart((s) => s.open);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-ink py-2 pl-2 pr-4 shadow-[0_18px_44px_-20px_rgba(15,26,20,0.4)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-fg">{t("addedToCart")}</span>
            <button onClick={openCart} className="text-sm font-semibold text-accent-strong hover:underline">
              {t("viewCart")}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
