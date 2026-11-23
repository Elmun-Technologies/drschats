"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import type { CareCopy } from "@/lib/care/content";
import { fillPercents } from "@/lib/care/content";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics/events";
import { DEFAULT_INTERVAL, SUBSCRIPTION_INTERVALS, subscriptionPricing, type IntervalDays } from "@/lib/subscription/plans";
import { cn, formatMoney } from "@/lib/utils";

/*
  The pregnancy box: the same Subscribe & Save line the product page adds,
  with the interval picked here. Prices come from the effective commerce
  percents passed in by the server page — the client never invents them.
*/
export function BoxPanel({
  product,
  image,
  copy,
  percents,
  locale,
  meta,
}: {
  product: Product;
  image: string;
  copy: NonNullable<CareCopy["box"]>;
  percents: { firstPercent: number; recurringPercent: number };
  locale: Locale;
  meta: string;
}) {
  const [days, setDays] = useState<IntervalDays>(DEFAULT_INTERVAL);
  const add = useCart((s) => s.add);
  const p = subscriptionPricing(product.price, percents);

  function addBox() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price: product.price,
      oldPrice: product.oldPrice,
      saleEndsAt: product.saleEndsAt,
      stockQty: product.stock?.qty,
      subscription: { intervalDays: days },
    });
    track("subscription_add_to_cart", { slug: product.slug, intervalDays: days, list: "care_box" });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-bg p-4 text-ink lg:rounded-3xl lg:p-7">
      <div className="flex items-center gap-4">
        <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-tile">
          <Image src={image} alt={product.name} fill sizes="96px" className="object-contain p-2" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[17px] font-bold leading-[22px]">{product.name}</span>
          <span className="text-[13px] leading-[18px] text-muted">{meta}</span>
        </span>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">{copy.interval}</legend>
        <div className="grid grid-cols-4 gap-2">
          {SUBSCRIPTION_INTERVALS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={d === days}
              onClick={() => setDays(d)}
              className={cn(
                "h-11 rounded-sm text-[15px] font-semibold transition-colors",
                d === days ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover",
              )}
            >
              {d} {copy.days}
            </button>
          ))}
        </div>
      </fieldset>

      <dl className="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{copy.once}</dt>
          <dd className="text-muted line-through">{formatMoney(product.price, locale)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{fillPercents(copy.first, percents)}</dt>
          <dd className="font-bold">{formatMoney(p.firstPrice, locale)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>
            {fillPercents(copy.recurring, percents)} · {days} {copy.days}
          </dt>
          <dd className="font-bold">{formatMoney(p.recurringPrice, locale)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={addBox}
        disabled={!product.inStock}
        className="h-[52px] rounded-sm bg-ink px-5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {copy.cta}
      </button>
      <p className="text-xs text-muted">{copy.note}</p>
    </div>
  );
}
