"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { discountPercent } from "@/lib/shop/discounts";
import type { Product } from "@/lib/shopflow/types";
import type { Locale } from "@/lib/i18n/routing";
import { formatMoney } from "@/lib/utils";

/*
  One real product at its real, lower price.

  Deliberately absent, in this order of importance:

  - a countdown. The clock ran to midnight every day, whether or not anything
    changed at midnight, which made a permanent markdown look like a flash sale
    and trained people to ignore the section. A timer comes back the day a
    promotion genuinely ends on a date.
  - a "27 of 40 sold" progress bar. The catalogue exposes `inStock` as a
    boolean and no quantity, so any number there would be invented.

  The text above the product says "Chegirmali tanlov", not "Kun tovari",
  because the price does not change daily.
*/
export function DealOfDay({ product }: { product: Product }) {
  const t = useTranslations("home.deal");
  const locale = useLocale() as Locale;
  const discount = discountPercent(product);
  const image = product.images[0]?.url;

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-brand-deep p-6 text-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-white/70">
          {/* A price tag, not a clock: the markdown is real but it is not
              running out at midnight. */}
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a1.2 1.2 0 0 1 1.2-1.2H12a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z" />
            <circle cx="7.5" cy="7.5" r="1.3" />
          </svg>
          {t("title")}
        </span>
        {discount > 0 && (
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-extrabold tabular-nums text-white">
            −{discount}%
          </span>
        )}
      </div>

      <Link href={`/product/${product.slug}`} className="group mt-5 flex flex-1 items-center gap-4">
        {image && (
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2 p-2 flex items-center justify-center">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-contain transition-transform duration-700"
            />
          </span>
        )}
        <span className="min-w-0">
          <span className="line-clamp-2 block font-display text-base font-extrabold leading-snug text-white transition-colors group-hover:text-white">
            {product.name}
          </span>
          <span className="mt-2 flex flex-col">
            <b className="whitespace-nowrap font-display text-xl font-extrabold tabular-nums text-white">
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
        <p className="mt-4 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-center text-xs font-extrabold text-white">
          {t("save", { amount: formatMoney(product.oldPrice - product.price, locale) })}
        </p>
      )}
    </div>
  );
}
