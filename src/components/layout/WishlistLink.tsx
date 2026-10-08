"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useWishlist } from "@/lib/wishlist/store";
import { CountBadge, HEADER_ITEM_CLASS, HeaderIcon, ICONS } from "./header-item";

/* The count renders only after mount: the store hydrates from localStorage. */
export function WishlistLink({ label }: { label: string }) {
  const count = useWishlist((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/wishlist" className={HEADER_ITEM_CLASS}>
      <HeaderIcon d={ICONS.heart} />
      {label}
      {mounted && count > 0 && <CountBadge>{count}</CountBadge>}
    </Link>
  );
}
