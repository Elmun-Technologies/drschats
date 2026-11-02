"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { CountBadge, HEADER_ITEM_CLASS, HeaderIcon, ICONS } from "./header-item";

/* Opens the cart drawer; the count renders after mount (localStorage). */
export function CartButton({ label }: { label: string }) {
  const toggle = useCart((s) => s.toggle);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = useTranslations("header");

  return (
    <button type="button" onClick={toggle} aria-label={mounted ? t("cartCount", { label, count }) : label} className={HEADER_ITEM_CLASS}>
      <HeaderIcon d={ICONS.bag} />
      <span aria-hidden>{label}</span>
      {mounted && count > 0 && <CountBadge>{count > 99 ? "99+" : count}</CountBadge>}
    </button>
  );
}
