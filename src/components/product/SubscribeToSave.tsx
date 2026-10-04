"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import {
  SUBSCRIPTION_INTERVALS,
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

  const isSub = mode === "subscription";

  return (
    <div role="radiogroup" aria-labelledby={`${groupId}-label`} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {/* These two strings were hardcoded Uzbek, so the Russian product page
            switched language at the buy box — the one block a shopper has to
            understand before paying. */}
        <p id={`${groupId}-label`} className="text-xs font-extrabold uppercase tracking-wider text-brand-deep">
          {t("chooseMode")}
        </p>
        <span className="rounded-full border border-line-strong bg-surface-2 px-2.5 py-0.5 text-[11px] font-extrabold text-muted">
          {t("autoDelivery")}
        </span>
      </div>

      {/* Subscription Option Card */}
      <label
        className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-300 ${
          isSub
            ? "border-brand-deep bg-surface-2 shadow-sm ring-1 ring-brand-deep/20"
            : "border-line bg-surface hover:border-line-strong"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name={groupId}
            checked={isSub}
            onChange={() => onModeChange("subscription")}
            className="mt-1 h-5 w-5 shrink-0 accent-gold cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-extrabold text-brand-deep">
                  {t("subscribe")}
                </span>
                <span className="rounded-full border border-line-strong bg-ink px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-deep">
                  {t("saveBadge", { percent: pricing.firstPercent })}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-display text-lg font-extrabold text-brand-deep">
                  {formatMoney(pricing.firstPrice, locale)}
                </span>
                {product.price && (
                  <span className="block text-xs text-faint line-through">
                    {formatMoney(product.price, locale)}
                  </span>
                )}
              </div>
            </div>

            {perServing !== null && (
              <p className="mt-1 text-xs text-muted">
                {t("perServing", { price: formatMoney(perServing, locale) })}
              </p>
            )}

            {/* Benefits List */}
            <div className="mt-3 rounded-xl bg-surface-2 p-3 border border-line/50">
              <ul className="flex flex-col gap-1.5 text-xs font-semibold text-fg">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal font-bold text-[10px]">✓</span>
                  <span className="min-w-0">{t("benefitFirst", { first: pricing.firstPercent, price: formatMoney(pricing.firstPrice, locale) })}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal font-bold text-[10px]">✓</span>
                  <span className="min-w-0">{t("benefitRecurring", { recurring: pricing.recurringPercent })}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal font-bold text-[10px]">✓</span>
                  <span className="min-w-0">{t("benefitCancel")}</span>
                </li>
              </ul>
            </div>

            {/* Interval Selector */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted">{t("deliveryInterval")}</span>
              <select
                aria-labelledby={`${groupId}-interval-label`}
                value={intervalDays}
                onChange={(e) => {
                  onIntervalChange(Number(e.target.value) as IntervalDays);
                  onModeChange("subscription");
                }}
                className="h-10 min-w-0 flex-1 basis-32 rounded-xl border border-line bg-surface-2 px-3 text-xs font-bold text-brand-deep outline-none focus:border-brand-deep focus:ring-1 focus:ring-brand-deep/30"
              >
                {SUBSCRIPTION_INTERVALS.map((days) => (
                  <option key={days} value={days}>
                    {t("everyDays", { days })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </label>

      {/* One-Time Purchase Option Card */}
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
          !isSub
            ? "border-brand-deep bg-surface-2 shadow-xs ring-1 ring-brand-deep/20"
            : "border-line bg-surface hover:border-line-strong"
        }`}
      >
        <input
          type="radio"
          name={groupId}
          checked={!isSub}
          onChange={() => onModeChange("one-time")}
          className="h-5 w-5 shrink-0 accent-brand-deep cursor-pointer"
        />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <span className="font-display text-sm font-extrabold text-brand-deep block">
              {t("oneTime")}
            </span>
            <span className="text-xs text-muted">{t("oneTimeNote")}</span>
          </div>
          <span className="font-display text-base font-extrabold text-brand-deep">
            {formatMoney(product.price, locale)}
          </span>
        </div>
      </label>
    </div>
  );
}
