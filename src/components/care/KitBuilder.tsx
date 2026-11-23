"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import type { CareCopy } from "@/lib/care/content";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics/events";
import { cn, formatMoney } from "@/lib/utils";

export interface KitItem {
  product: Product;
  image: string;
  note: string;
}

/*
  The baby's home kit: tick what you need, the total is the plain sum of
  catalogue prices — no invented bundle discount. Adding puts each ticked
  product in the cart as an ordinary line and opens the cart once.
*/
export function KitBuilder({
  items,
  initial,
  copy,
  locale,
}: {
  items: KitItem[];
  initial: string[];
  copy: NonNullable<CareCopy["kit"]>;
  locale: Locale;
}) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(initial));
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  const chosen = items.filter((i) => picked.has(i.product.slug) && i.product.inStock);
  const total = chosen.reduce((sum, i) => sum + i.product.price, 0);

  function toggle(slug: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function addKit() {
    for (const { product } of chosen) {
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url ?? "",
          price: product.price,
          oldPrice: product.oldPrice,
          saleEndsAt: product.saleEndsAt,
          stockQty: product.stock?.qty,
        },
        1,
        { silent: true },
      );
    }
    track("care_kit_add", { slugs: chosen.map((i) => i.product.slug), value: total });
    open();
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] bg-bg p-4 text-ink lg:rounded-3xl lg:p-6">
      {items.map(({ product, image, note }) => {
        const on = picked.has(product.slug);
        return (
          <button
            key={product.slug}
            type="button"
            aria-pressed={on}
            disabled={!product.inStock}
            onClick={() => toggle(product.slug)}
            className={cn(
              "flex min-h-[72px] items-center gap-3 rounded-2xl border-2 p-2.5 pr-3.5 text-left transition-colors disabled:opacity-50",
              on ? "border-ink" : "border-line hover:border-line-strong",
            )}
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-tile">
              <Image src={image} alt="" fill sizes="56px" className="object-contain p-1" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold leading-5">{product.name}</span>
              {note && <span className="text-[13px] text-muted">{note}</span>}
            </span>
            <span className="whitespace-nowrap text-[15px] font-bold lg:text-base">{formatMoney(product.price, locale)}</span>
            <span
              aria-hidden
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px]",
                on ? "bg-ink text-white" : "border-[1.5px] border-control bg-bg",
              )}
            >
              {on && (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}

      <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-[15px] text-ink-2">
          {chosen.length} {copy.count}
        </span>
        <span className="text-[24px] font-extrabold lg:text-[28px]">{formatMoney(total, locale)}</span>
      </div>
      <button
        type="button"
        onClick={addKit}
        disabled={chosen.length === 0}
        className="h-[52px] rounded-sm bg-ink px-5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {copy.cta}
      </button>
    </div>
  );
}
