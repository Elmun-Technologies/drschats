"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCompare } from "@/lib/compare/store";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

/* Adds the product to /compare (design: ProductV3 meta row, ProductMobileV3 icon row). */
export function CompareButton({ productId, iconOnly = false, className }: { productId: string; iconOnly?: boolean; className?: string }) {
  const t = useTranslations("shop.compare");
  const toggle = useCompare((s) => s.toggle);
  const inList = useCompare((s) => s.items.includes(productId));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const on = mounted && inList;

  return (
    <button
      type="button"
      onClick={() => {
        toggle(productId);
        track(on ? "compare_remove" : "compare_add", { product_id: productId });
      }}
      aria-pressed={on}
      aria-label={iconOnly ? t("add") : undefined}
      className={cn("inline-flex items-center gap-1.5", on && "font-semibold text-ink", className)}
    >
      <svg viewBox="0 0 24 24" aria-hidden className={iconOnly ? "h-6 w-6" : "h-[18px] w-[18px]"} fill="none" stroke="currentColor" strokeWidth={on ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 20V10M12 20V4M18 20v-7" />
      </svg>
      {!iconOnly && (on ? t("added") : t("add"))}
    </button>
  );
}
