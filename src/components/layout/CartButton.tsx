"use client";

import { useEffect, useState } from "react";
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
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-line-strong"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
        <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-ink">
          {count}
        </span>
      )}
    </button>
  );
}
