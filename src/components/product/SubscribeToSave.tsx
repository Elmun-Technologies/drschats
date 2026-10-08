"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { cn, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SUBSCRIPTION_INTERVALS, subscriptionPricing } from "@/lib/subscription/plans";
import { usePurchase } from "@/components/product/purchase";

/*
  The buy box's two ways to buy (design: kit `.opt` cards).

  Two radio cards rather than a checkbox, because "subscribe and save" is not a
  modifier on a purchase — it is a different purchase, with a different price
  and a commitment attached. The one-off price stays visible next to the
  subscription price the whole time, and the recurring discount is stated as
  plainly as the first one: a subscription whose real price only appears on
  the second delivery is a trap, and this one is not built to be.
*/
export function SubscribeToSave({ product }: { product: Product }) {
  const t = useTranslations("subscription");
  const tv = useTranslations("product.v3");
  const locale = useLocale() as Locale;
  const name = useId();
  const mode = usePurchase((s) => s.mode);
  const intervalDays = usePurchase((s) => s.intervalDays);
  const setMode = usePurchase((s) => s.setMode);
  const setIntervalDays = usePurchase((s) => s.setIntervalDays);
  const pricing = subscriptionPricing(product.price);
  const isSub = mode === "subscription";

  return (
    <div role="radiogroup" aria-label={t("chooseMode")} className="flex flex-col gap-2">
      <label className={optionClass(!isSub)}>
        <input type="radio" name={name} checked={!isSub} onChange={() => setMode("one-time")} className={RADIO} />
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold">{t("oneTime")}</span>
          <span className="text-sm text-muted">{formatMoney(product.price, locale)}</span>
        </span>
      </label>

      <div className={cn(optionClass(isSub), "flex-col gap-3")}>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="radio" name={name} checked={isSub} onChange={() => setMode("subscription")} className={RADIO} />
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-base font-semibold">{t("subscribe")}</span>
              <Badge tone="hit" className="h-[22px] px-2 text-xs">{t("bestValue")}</Badge>
            </span>
            <span className="text-sm leading-5 text-muted">
              {tv("subOffer", {
                price: formatMoney(pricing.firstPrice, locale),
                first: pricing.firstPercent,
                recurring: pricing.recurringPercent,
              })}
            </span>
          </span>
        </label>
        {isSub && (
          <div role="group" aria-label={t("intervalLabel")} className="flex flex-wrap gap-1.5 pl-8">
            {SUBSCRIPTION_INTERVALS.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={days === intervalDays}
                onClick={() => setIntervalDays(days)}
                className={cn(
                  "h-11 rounded-sm px-3.5 text-[15px] font-medium transition-colors",
                  days === intervalDays ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover",
                )}
              >
                {tv("intervalDays", { days })}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function optionClass(on: boolean) {
  return cn(
    "flex cursor-pointer items-start gap-3 rounded-[14px] border-[1.5px] bg-bg p-4 transition-colors",
    on ? "border-ink" : "border-line hover:border-line-strong",
  );
}

const RADIO =
  "mt-px h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-[#8A8F95] transition-[border] checked:border-[6px] checked:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
