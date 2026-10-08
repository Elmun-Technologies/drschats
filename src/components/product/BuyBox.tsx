"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { DiscountBadge, discountPercent } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/Choice";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { track, trackAddToCart, trackViewProduct } from "@/lib/analytics/events";
import { DEFAULT_INTERVAL, SUBSCRIPTION_INTERVALS, subscriptionPricing, type IntervalDays } from "@/lib/subscription/plans";
import { unitPrice } from "@/lib/content/product-units";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";

const MAX_QTY = 20;

type PurchaseMode = "one-time" | "subscription";

/*
  The buy card (design: ProductV3 aside). Price with the struck reference and
  "−N%", the per-unit price, the two ways to buy, quantity, "Savatga
  qoʻshish" and "Hozir buyurtma berish".

  Subscribe & Save is a choice between two priced options rather than a
  checkbox: it is a different purchase with a commitment attached, and the
  recurring price is stated next to today's one, never only on the second
  delivery. "Eng foydali" is a neutral pill — yellow is reserved for "Xit" and
  the price guarantee.
*/
export function BuyBox({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tp = useTranslations("product.buyBox");
  const v3 = useTranslations("product.v3");
  const ts = useTranslations("subscription");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<PurchaseMode>("one-time");
  const [intervalDays, setIntervalDays] = useState<IntervalDays>(DEFAULT_INTERVAL);

  const discount = discountPercent(product.price, product.oldPrice);
  const perUnit = unitPrice(product.slug, product.price);
  const pricing = subscriptionPricing(product.price);
  const subscribing = mode === "subscription";

  useEffect(() => {
    trackViewProduct(product.slug, product.price);
  }, [product.slug, product.price]);

  function addToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price: product.price,
        oldPrice: product.oldPrice,
        subscription: subscribing ? { intervalDays } : undefined,
      },
      qty,
    );
    trackAddToCart(product.slug, product.price, qty);
    if (subscribing) {
      track("subscription_add_to_cart", { slug: product.slug, intervalDays });
    }
  }

  const saving = product.oldPrice && product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const subLine = [
    perUnit && t("perUnit", { price: formatMoney(perUnit.amount, locale), unit: t(perUnit.unit === "tablet" ? "unitTablet" : "unitCapsule") }),
    saving > 0 && tp("youSave", { amount: formatMoney(saving, locale) }),
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4 lg:rounded-[20px] lg:border lg:border-line lg:bg-bg lg:p-6 lg:shadow-buybox">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="whitespace-nowrap text-[28px] font-bold leading-9 lg:text-price-l">
            {formatMoney(product.price, locale)}
          </span>
          {saving > 0 && (
            <span className="whitespace-nowrap text-lg text-muted line-through">
              {formatNumber(product.oldPrice as number)}
            </span>
          )}
          <DiscountBadge percent={discount} className="hidden lg:inline-flex" />
        </div>
        {subLine.length > 0 && <span className="text-sm text-ink-2">{subLine.join(" · ")}</span>}
      </div>

      {product.inStock && (
        <div role="radiogroup" aria-label={ts("chooseMode")} className="flex flex-col gap-2">
          <RadioCard name={`mode-${product.id}`} checked={!subscribing} onChange={() => setMode("one-time")}>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{ts("oneTime")}</span>
              <span className="text-sm text-muted">{formatMoney(product.price, locale)}</span>
            </span>
          </RadioCard>
          <RadioCard name={`mode-${product.id}`} checked={subscribing} onChange={() => setMode("subscription")}>
            <span className="flex flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">{ts("subscribe")}</span>
                <Badge className="h-[22px] text-xs">{ts("bestValue")}</Badge>
              </span>
              <span className="text-sm text-muted">
                {v3("subscribeNote", {
                  first: formatMoney(pricing.firstPrice, locale),
                  firstPercent: pricing.firstPercent,
                  recurringPercent: pricing.recurringPercent,
                })}
              </span>
            </span>
          </RadioCard>
          {subscribing && (
            <div role="radiogroup" aria-label={v3("interval")} className="flex flex-wrap gap-2 pt-1">
              {SUBSCRIPTION_INTERVALS.map((days) => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  aria-checked={intervalDays === days}
                  onClick={() => setIntervalDays(days)}
                  className={cn(
                    "inline-flex h-11 items-center rounded-sm px-4 text-[15px] font-medium transition-colors",
                    intervalDays === days ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover",
                  )}
                >
                  {v3("intervalDays", { days })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {product.inStock ? (
        <>
          <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-2">
            <div role="group" aria-label={t("quantity")} className="flex h-14 items-center justify-between rounded-[14px] bg-tile">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label={tp("decrease")}
                className="flex h-14 w-11 items-center justify-center text-[22px] font-medium disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className="text-[17px] font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label={tp("increase")}
                className="flex h-14 w-11 items-center justify-center text-[22px] font-medium disabled:opacity-40"
              >
                +
              </button>
            </div>
            <Button
              onClick={() => {
                addToCart();
                notify();
              }}
              className="h-14 rounded-[14px] text-[17px]"
            >
              {subscribing ? ts("addSubscription") : t("addToCart")}
            </Button>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => {
              addToCart();
              openCart();
            }}
          >
            {t("buyNow")}
          </Button>
          {qty > 1 && (
            <p className="text-sm text-ink-2">
              {tp("total")}: <span className="font-semibold text-ink">{formatMoney(product.price * qty, locale)}</span>
            </p>
          )}
          <p className="flex items-center gap-2 text-[15px] font-medium">
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
            {v3("inStockWhere")}
          </p>
        </>
      ) : (
        <>
          <Button disabled size="lg" className="w-full">{t("outOfStock")}</Button>
          <OutOfStockNotify productId={product.id} productName={product.name} />
        </>
      )}
    </div>
  );
}
