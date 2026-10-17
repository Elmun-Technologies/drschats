"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { SaleCountdown } from "@/components/marketing/SaleCountdown";
import { useUnexpired } from "@/components/marketing/BannerLink";
import { discountPercent } from "@/components/layout/menu-deal";
import { SalePill } from "./HomeHero";

/*
  "Bugungi taklif": the deal of the day the team schedules in admin → Vitrina.
  The price on the card is the catalogue's own — the same engine the order
  action prices with — and the countdown runs to the deal's real end, at
  which point the block leaves the page (the card's price reverts with it).
*/
export function DealOfDay({ product, endsAt }: { product: Product; endsAt: string }) {
  const t = useTranslations("home.v3.dealOfDay");
  const locale = useLocale() as Locale;
  const items = useMemo(() => [{ endsAt }], [endsAt]);
  const live = useUnexpired(items);
  if (live.length === 0 || !product.oldPrice) return null;
  const deal = { price: product.price, oldPrice: product.oldPrice };

  return (
    <section aria-labelledby="home-deal-of-day" className="wrap">
      <div className="grid gap-5 rounded-3xl bg-dark-panel p-5 text-white md:grid-cols-[minmax(0,1fr)_260px] md:items-center md:gap-8 md:p-8 lg:grid-cols-[minmax(0,560px)_260px] lg:justify-between lg:rounded-[28px] lg:px-16 lg:py-10">
        <div className="flex flex-col items-start gap-3 lg:gap-4">
          <h2 id="home-deal-of-day" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
            {t("title")}
          </h2>
          <p className="max-w-[460px] text-[15px] leading-[21px] text-on-dark-2 lg:text-[17px] lg:leading-6">{t("lead")}</p>
          <Link href={`/product/${product.slug}`} className="text-lg font-semibold leading-6 hover:underline max-md:hidden lg:text-[22px] lg:leading-7">
            {product.name}
          </Link>
          <span className="flex flex-wrap items-baseline gap-x-2.5 max-md:hidden">
            <span className="text-[30px] font-bold leading-9">{formatMoney(deal.price, locale)}</span>
            <span className="text-[17px] text-on-dark-2 line-through">{formatMoney(deal.oldPrice, locale)}</span>
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <SalePill percent={discountPercent(deal)} />
            <span className="text-[15px] font-semibold">{t("save", { amount: formatMoney(deal.oldPrice - deal.price, locale) })}</span>
          </div>
          <SaleCountdown endsAt={endsAt} onDark className="text-[15px] lg:text-[17px]" />
        </div>
        <div className="mx-auto w-full max-w-[220px] md:max-w-[260px]">
          <ProductCard product={product} onCard />
        </div>
      </div>
    </section>
  );
}
