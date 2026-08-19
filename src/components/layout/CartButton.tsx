"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart/store";

export function CartButton({ label }: { label: string }) {
  const toggle = useCart((s) => s.toggle);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-surface-2 text-brand-deep transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-deep" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
        <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
      </svg>
      <AnimatePresence>
        {mounted && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1.3, 1], opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-extrabold text-brand-deep shadow-md shadow-gold/30"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
