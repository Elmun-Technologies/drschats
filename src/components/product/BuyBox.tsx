"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { DiscountBadge, discountPercent } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";
import { trackViewProduct } from "@/lib/analytics/events";
import type { Expert } from "@/lib/content/experts";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";
import { SubscribeToSave } from "@/components/product/SubscribeToSave";
import { MAX_QTY, useAddToCart, usePurchase } from "@/components/product/purchase";
import { unitPriceOf } from "@/lib/catalog/product-facts";

/*
  Design: ProductV3 buy card. Price, the two ways to buy, quantity and the two
  actions. On a phone the card keeps the price and the choice; the actions move
  to the fixed bar above the tab bar (MobileBuyBar), which adds the same thing.
*/
export function BuyBox({ product, reviewer }: { product: Product; reviewer?: Expert | null }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tv = useTranslations("product.v3");
  const tb = useTranslations("product.buyBox");
  const ts = useTranslations("subscription");
  const openCart = useCart((s) => s.open);
  const reset = usePurchase((s) => s.reset);
  const qty = usePurchase((s) => s.qty);
  const setQty = usePurchase((s) => s.setQty);
  const mode = usePurchase((s) => s.mode);
  const addToCart = useAddToCart(product);

  const discount = discountPercent(product.price, product.oldPrice);
  const perUnit = unitPriceOf(product);

  useEffect(() => reset(product.id), [reset, product.id]);

  useEffect(() => {
    trackViewProduct(product.slug, product.price);
  }, [product.slug, product.price]);

  return (
    <div className="flex flex-col gap-4 lg:rounded-[20px] lg:border lg:border-line lg:bg-bg lg:p-6 lg:shadow-buybox">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[30px] font-bold leading-9 lg:text-price-l lg:leading-10">{formatMoney(product.price, locale)}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-[17px] text-muted line-through lg:text-lg">{formatNumber(product.oldPrice)}</span>
          )}
          <DiscountBadge percent={discount} className="h-[26px] px-2.5 text-sm" />
        </div>
        {(perUnit || discount > 0) && (
          <span className="text-sm text-ink-2">
            {[
              perUnit && t("perUnit", { price: formatMoney(Math.round(perUnit.amount), locale), unit: t(perUnit.unit === "tablet" ? "unitTablet" : "unitCapsule") }),
              discount > 0 && product.oldPrice && tv("saving", { amount: formatMoney(product.oldPrice - product.price, locale) }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}
      </div>

      {product.inStock && <SubscribeToSave product={product} />}

      {product.inStock ? (
        <div id="buybox-cta" className="hidden scroll-mt-40 flex-col gap-2 lg:flex">
          <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-2">
            <div role="group" aria-label={t("quantity")} className="flex h-14 items-center justify-between rounded-[14px] bg-tile">
              <button
                type="button"
                onClick={() => setQty(qty - 1)}
                disabled={qty <= 1}
                aria-label={tb("decrease")}
                className="flex h-14 w-11 items-center justify-center text-[22px] font-medium disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className="text-[17px] font-bold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                disabled={qty >= MAX_QTY}
                aria-label={tb("increase")}
                className="flex h-14 w-11 items-center justify-center text-[22px] font-medium disabled:opacity-40"
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              className="h-14 rounded-[14px] px-4"
              onClick={() => {
                addToCart();
              }}
            >
              {mode === "subscription" ? ts("addSubscription") : t("addToCart")}
            </Button>
          </div>
          <Button
            variant="light"
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
              {tb("total")}: <span className="font-semibold text-ink">{formatMoney(product.price * qty, locale)}</span>
            </p>
          )}
        </div>
      ) : (
        <OutOfStockNotify productId={product.id} productName={product.name} />
      )}

      <span className={cn("flex items-center gap-2 text-[15px] font-medium", !product.inStock && "text-red")}>
        <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d={product.inStock ? "M5 12l5 5 9-10" : "M6 6l12 12M18 6L6 18"} />
        </svg>
        {product.inStock ? t("inStock") : t("outOfStock")}
      </span>

      {reviewer && <ReviewedBy expert={reviewer} />}

      <MobileBuyBar product={product} />
    </div>
  );
}

/*
  Phones: price and "Savatga qoʻshish" fixed above the tab bar. `data-buy-bar`
  is what makes `--bottom-nav` grow by the bar's height (globals.css), so the
  footer, toasts and the back-to-top button clear it.
*/
function MobileBuyBar({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const addToCart = useAddToCart(product);

  return (
    <div
      data-buy-bar
      className="fixed inset-x-0 bottom-[var(--tab-bar)] z-40 flex h-[var(--buy-bar)] items-center gap-2.5 border-t border-line bg-bg px-4 lg:hidden"
    >
      <div className="flex shrink-0 flex-col">
        <span className="text-[19px] font-bold leading-[23px]">{formatMoney(product.price, locale)}</span>
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="text-[13px] text-muted line-through">{formatNumber(product.oldPrice)}</span>
        )}
      </div>
      <Button
        size="lg"
        className="min-w-0 flex-1 rounded-[14px]"
        disabled={!product.inStock}
        onClick={() => {
          addToCart();
        }}
      >
        {product.inStock ? t("addToCart") : t("outOfStock")}
      </Button>
    </div>
  );
}

/** Desktop: the small card that stays beside the long sections. */
export function MiniBuyCard({ product, image }: { product: Product; image?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const addToCart = useAddToCart(product);

  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-line bg-bg p-3.5">
      {image && (
        <span className="relative h-[72px] w-[72px] shrink-0 rounded-[14px] bg-tile">
          <Image src={image} alt="" fill sizes="72px" className="object-contain p-1.5" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm text-ink-2">{product.name}</span>
        <span className="text-xl font-bold">{formatMoney(product.price, locale)}</span>
      </div>
      <Button
        className="px-[18px]"
        disabled={!product.inStock}
        onClick={() => {
          addToCart();
        }}
      >
        {t("addToCartShort")}
      </Button>
    </div>
  );
}
