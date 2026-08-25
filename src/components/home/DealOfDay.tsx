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

  useEffect(() => {
    const end = new Date();
    end.setHours(24, 0, 0, 0);
    setEndsAt(end);
  }, []);

  const discount = discountPercent(product);
  const image = product.images[0]?.url;

  return (
    <div className="flex flex-col rounded-[2rem] border border-white/10 bg-brand-deep p-6 text-white shadow-2xl shadow-brand-deep/30">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gold">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="8.2" />
            <path d="M12 7.6V12l3 1.9" />
          </svg>
          {t("title")}
        </span>
        {discount > 0 && (
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-brand-deep shadow-md shadow-gold/20">
            −{discount}%
          </span>
        )}
      </div>

      <div className="mt-3 min-h-[42px]">
        {endsAt && <CountdownTimer targetDate={endsAt} label={t("endsIn")} />}
      </div>

      <Link href={`/product/${product.slug}`} className="group mt-4 flex flex-1 items-center gap-4">
        {image && (
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2 p-2 flex items-center justify-center">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-contain transition-transform duration-700 group-hover:scale-110"
            />
          </span>
        )}
        <span className="min-w-0">
          <span className="line-clamp-2 block font-display text-base font-extrabold leading-snug text-white transition-colors group-hover:text-gold">
            {product.name}
          </span>
          <span className="mt-2 flex flex-wrap items-baseline gap-2">
            <b className="font-display text-xl font-extrabold tabular-nums text-white">
              {formatMoney(product.price, locale)}
            </b>
            {product.oldPrice && (
              <s className="text-xs tabular-nums text-white/60 line-through">
                {formatMoney(product.oldPrice, locale)}
              </s>
            )}
          </span>
        </span>
      </Link>

      {product.oldPrice && (
        <p className="mt-4 rounded-xl bg-gold/15 border border-gold/30 px-3.5 py-2 text-xs font-extrabold text-gold text-center">
          {t("save", { amount: formatMoney(product.oldPrice - product.price, locale) })}
        </p>
      )}
    </div>
  );
}
