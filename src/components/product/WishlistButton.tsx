"use client";

import { useWishlist } from "@/lib/wishlist/store";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics/events";

export function WishlistButton({
  productId,
  className = "",
  showLabel = false,
}: {
  productId: string;
  className?: string;
  /** Icon plus "Sevimlilarga", as in the product page's meta row. */
  showLabel?: boolean;
}) {
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
      aria-label={showLabel ? undefined : saved ? t("remove") : t("add")}
      aria-pressed={showLabel ? saved : undefined}
      className={`flex items-center justify-center gap-1.5 rounded-full transition-colors ${saved ? "text-red" : "text-ink hover:text-red"} ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
      {showLabel && <span className="text-ink-2">{t("add")}</span>}
    </button>
  );
}
