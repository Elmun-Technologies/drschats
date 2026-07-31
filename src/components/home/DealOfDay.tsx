"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { discountPercent } from "@/lib/shop/discounts";
import type { Product } from "@/lib/shopflow/types";
import type { Locale } from "@/lib/i18n/routing";
import { formatMoney } from "@/lib/utils";

/*
  The panel a marketplace shopper looks for first: one real product, its real
  discount, and a real deadline.

  Deliberately absent: a "27 of 40 sold" progress bar. The catalogue exposes
  `inStock` as a boolean and no quantity, so any number there would be
  invented — and invented scarcity on a pharmacy storefront is not a design
  flourish. If the backend ever returns stock counts, the bar belongs here.
*/
export function DealOfDay({ product }: { product: Product }) {
  const t = useTranslations("home.deal");
  const locale = useLocale() as Locale;
  const [endsAt, setEndsAt] = useState<Date | null>(null);

  // Midnight in the visitor's own timezone, resolved after mount so the server
  // and the client never disagree about when "today" ends.
  useEffect(() => {
    const end = new Date();
    end.setHours(24, 0, 0, 0);
    setEndsAt(end);
  }, []);

  const discount = discountPercent(product);
  const image = product.images[0]?.url;

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-ink p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-danger">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="8.2" />
            <path d="M12 7.6V12l3 1.9" />
          </svg>
          {t("title")}
        </span>
        {discount > 0 && (
          <span className="rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
            −{discount}%
          </span>
        )}
      </div>

      {/* Height is reserved so the countdown appearing after mount does not
          push the product down the panel. */}
      <div className="mt-3 min-h-[42px]">
        {endsAt && <CountdownTimer targetDate={endsAt} label={t("endsIn")} />}
      </div>

      {/* `flex-1`: the panel's height is set by the cards beside it, so the
          product row absorbs the slack rather than leaving a gap at the bottom. */}
      <Link href={`/product/${product.slug}`} className="group mt-2 flex flex-1 items-center gap-4">
        {image && (
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
            <Image
              src={image}
              alt=""
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </span>
        )}
        <span className="min-w-0">
          <span className="line-clamp-2 block font-display text-sm font-bold leading-snug text-fg transition-colors group-hover:text-accent-strong">
            {product.name}
          </span>
          <span className="mt-1.5 flex flex-wrap items-baseline gap-2">
            <b className="font-display text-lg font-extrabold tabular-nums text-danger">
              {formatMoney(product.price, locale)}
            </b>
            {product.oldPrice && (
              <s className="text-xs tabular-nums text-muted">
                {formatMoney(product.oldPrice, locale)}
              </s>
            )}
          </span>
        </span>
      </Link>

      {product.oldPrice && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
          {t("save", { amount: formatMoney(product.oldPrice - product.price, locale) })}
        </p>
      )}
    </div>
  );
}
