"use client";

import { useWishlist } from "@/lib/wishlist/store";
import { useTranslations } from "next-intl";
import { track, trackAddToWishlist } from "@/lib/analytics/events";

export function WishlistButton({
  productId,
  className = "",
  label,
  iconClassName = "h-[18px] w-[18px]",
}: {
  productId: string;
  className?: string;
  /** Visible text beside the heart; without it the button is icon-only. */
  label?: { add: string; saved: string };
  iconClassName?: string;
}) {
  const t = useTranslations("wishlist");
  const { toggle, has } = useWishlist();
  const saved = has(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    if (saved) track("remove_from_wishlist", { item_id: productId });
    else trackAddToWishlist({ item_id: productId });
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label={label ? undefined : saved ? t("remove") : t("add")}
      aria-pressed={label ? saved : undefined}
      className={`flex items-center justify-center rounded-full transition-colors ${saved ? "text-red" : "text-ink hover:text-red"} ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className={iconClassName} fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
      {label && (saved ? label.saved : label.add)}
    </button>
  );
}
