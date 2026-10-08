"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useCompare } from "@/lib/compare/store";
import { CountBadge, HEADER_ITEM_CLASS, HeaderIcon, ICONS } from "./header-item";

/* Design: HeaderV3 "Taqqoslash". The count renders after mount, as the wishlist's does. */
export function CompareLink({ label }: { label: string }) {
  const count = useCompare((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/compare" className={HEADER_ITEM_CLASS}>
      <HeaderIcon d={ICONS.compare} />
      {label}
      {mounted && count > 0 && <CountBadge>{count}</CountBadge>}
    </Link>
  );
}
