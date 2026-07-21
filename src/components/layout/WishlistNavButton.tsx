"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import { useWishlist } from "@/lib/wishlist/store";

export function WishlistNavButton({ label }: { label: string }) {
  const count = useWishlist((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/wishlist"
      aria-label={label}
      className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-line-strong sm:flex"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinejoin="round" />
      </svg>
      <AnimatePresence>
        {mounted && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1.4, 1], opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-ink"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
