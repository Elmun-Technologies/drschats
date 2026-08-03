"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import {
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_FREE_SHIPPING_OVER,
  pricePerServing,
  subscriptionPricing,
  type IntervalDays,
} from "@/lib/subscription/plans";

export type PurchaseMode = "one-time" | "subscription";

interface Props {
  product: Product;
  mode: PurchaseMode;
  intervalDays: IntervalDays;
  onModeChange: (mode: PurchaseMode) => void;
  onIntervalChange: (days: IntervalDays) => void;
}

/*
  The buy box's two ways to buy.

  Two radio cards rather than a checkbox, because "subscribe and save" is not a
  modifier on a purchase — it is a different purchase, with a different price,
  a different shipping rule and a commitment attached. Showing it as a choice
  between two priced options is also the only honest way to present it: the
  one-off price stays visible next to the subscription price the whole time.

  The recurring price is stated as plainly as the first one. A subscription
  whose real price only appears on the second delivery is a trap, and this one
  is not built to be.
*/
export function SubscribeToSave({
  product,
  mode,
  intervalDays,
  onModeChange,
  onIntervalChange,
}: Props) {
  const t = useTranslations("subscription");
  const locale = useLocale() as Locale;
  const groupId = useId();
  const pricing = subscriptionPricing(product.price);
  const perServing = pricePerServing(pricing.recurringPrice, product.servings);

  const selected = mode === "subscription";

  return (
    <div role="radiogroup" aria-labelledby={`${groupId}-label`} className="flex flex-col gap-3">
      <p id={`${groupId}-label`} className="text-sm font-semibold text-fg">
        {t("chooseMode")}
      </p>

      <label
        className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
          selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong"
        }`}
      >
        <input
          type="radio"
          name={groupId}
          checked={selected}
          onChange={() => onModeChange("subscription")}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-base font-bold text-fg">{t("subscribe")}</span>
            <span className="text-right">
              <span className="block font-display text-lg font-extrabold text-fg">
                {formatMoney(pricing.firstPrice, locale)}
              </span>
              {perServing !== null && (
                <span className="block text-xs text-muted">
                  {t("perServing", { price: formatMoney(perServing, locale) })}
                </span>
              )}
            </span>
          </span>

          <span className="mt-1 inline-flex rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white">
            {t("bestValue")}
          </span>

          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-fg">
            <li>{t("benefitDiscount", { first: pricing.firstPercent, recurring: pricing.recurringPercent })}</li>
            <li>{t("benefitShipping", { amount: formatMoney(SUBSCRIPTION_FREE_SHIPPING_OVER, locale) })}</li>
            <li>{t("benefitControl")}</li>
          </ul>

          <span className="mt-3 block">
            <span className="sr-only" id={`${groupId}-interval-label`}>
              {t("intervalLabel")}
            </span>
            <select
              aria-labelledby={`${groupId}-interval-label`}
              value={intervalDays}
              onChange={(e) => {
                onIntervalChange(Number(e.target.value) as IntervalDays);
                // Choosing a rhythm is choosing the subscription; making the
                // customer then find the radio would be a needless second step.
                onModeChange("subscription");
              }}
              className="h-11 w-full rounded-full border border-line bg-ink px-4 text-sm font-medium text-fg outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SUBSCRIPTION_INTERVALS.map((days) => (
                <option key={days} value={days}>
                  {t("everyDays", { days })}
                </option>
              ))}
            </select>
          </span>

          <span className="mt-2 block text-xs text-muted">
            {t("recurringNote", {
              price: formatMoney(pricing.recurringPrice, locale),
              days: intervalDays,
            })}
          </span>
        </span>
      </label>

      <label
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
          selected ? "border-line bg-surface hover:border-line-strong" : "border-accent bg-accent-soft"
        }`}
      >
        <input
          type="radio"
          name={groupId}
          checked={!selected}
          onChange={() => onModeChange("one-time")}
          className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-base font-bold text-fg">{t("oneTime")}</span>
          <span className="font-display text-lg font-extrabold text-fg">
            {formatMoney(product.price, locale)}
          </span>
        </span>
      </label>
    </div>
  );
}
