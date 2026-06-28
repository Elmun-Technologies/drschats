"use client";

import { useWishlist } from "@/lib/wishlist/store";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics/events";

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const t = useTranslations("wishlist");
  const { toggle, has } = useWishlist();
  const saved = has(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    track(saved ? "wishlist_remove" : "wishlist_add", { product_id: productId });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? t("remove") : t("add")}
      className={`flex items-center justify-center rounded-full transition-colors ${saved ? "text-red-400" : "text-faint hover:text-red-400"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
