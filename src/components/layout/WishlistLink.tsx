"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useWishlist } from "@/lib/wishlist/store";

/*
  Products could be saved from every card on the site and there was nowhere to
  see them afterwards. This is the way back in.

  The count renders only after mount: the store hydrates from localStorage on
  the client, so a server-rendered badge would either be wrong or force the
  page out of static rendering.
*/
export function WishlistLink({ label }: { label: string }) {
  const count = useWishlist((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/wishlist"
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-line-strong hover:text-accent-strong"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-brand-deep">
          {count}
        </span>
      )}
    </Link>
  );
}
