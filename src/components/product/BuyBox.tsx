"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { DiscountBadge, Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { track, trackAddToCart, trackViewProduct } from "@/lib/analytics/events";
import { SubscribeToSave, type PurchaseMode } from "@/components/product/SubscribeToSave";
import { DEFAULT_INTERVAL, type IntervalDays } from "@/lib/subscription/plans";
import { ONLINE_PROVIDERS } from "@/lib/config/payments";
import { reviewerForKey } from "@/lib/content/experts";
import type { Expert } from "@/lib/content/experts";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ShareButton } from "@/components/product/ShareButton";

const MAX_QTY = 20;

/*
  Trust marks, in the health colour.

  These icons were champagne gold on a gold-tinted tile, which put the money
  colour on delivery, returns and secure payment — three things a shopper is
  not buying. They now use `signal`, the colour this site reserves for the
  things it can actually prove.
*/
function TrustItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl p-2 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal">
        {children}
      </span>
      <p className="text-[11px] font-bold leading-tight text-fg">{label}</p>
    </div>
  );
}

export function BuyBox({ product, reviewer: reviewerProp }: { product: Product; reviewer?: Expert | null }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tp = useTranslations("product.buyBox");
  const ts = useTranslations("subscription");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<PurchaseMode>("one-time");
  const [intervalDays, setIntervalDays] = useState<IntervalDays>(DEFAULT_INTERVAL);
  // Null when no verified expert is on file — the badge below is hidden then.
  const reviewer = reviewerProp ?? reviewerForKey(product.id, locale);
  // Configured online providers only — see lib/config/payments.
  const onlineProviderNames = ONLINE_PROVIDERS.map((p) => p.label);

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  useEffect(() => {
    trackViewProduct(product.slug, product.price);
  }, [product.slug, product.price]);

  function addToCart() {
    const subscribing = mode === "subscription";
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

  function handleAdd() {
    addToCart();
    notify();
  }

  function handleBuyNow() {
    addToCart();
    openCart();
  }

  return (
    <div className="flex flex-col gap-5">
      {product.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.badges.map((b) => (
            <Badge key={b} tone="accent">
              {b}
            </Badge>
          ))}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-2 text-base text-muted">{product.tagline}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <StarRating rating={product.rating} />
        {product.reviewCount > 0 && (
          <a href="#reviews" className="text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-fg">
            {t("reviews", { count: product.reviewCount })}
          </a>
        )}
        {/* Availability — the catalogue exposes `inStock` as a boolean and no
            quantity, so a "only N left" counter would be invented. State is
            enough; scarcity is withheld until the backend returns real stock. */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              product.inStock ? "text-signal" : "text-danger"
            }`}
          >
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-full ${product.inStock ? "bg-signal" : "bg-danger"}`}
            />
            {product.inStock ? t("inStock") : t("outOfStock")}
          </span>
        </div>
      </div>

      {reviewer && <ReviewedBy expert={reviewer} />}

      {/* Price */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="lg" />
          {/* One discount badge across the whole site, and it is neutral: a red
              pill beside a price reads as a warning, and a gold one competes
              with the button the shopper is meant to press. */}
          <DiscountBadge percent={discountPercent} />
        </div>
        {product.oldPrice && (
          <p className="mt-1 text-xs font-medium text-danger">
            {tp("youSave", { amount: formatMoney(product.oldPrice - product.price, locale) })}
          </p>
        )}
      </div>

      {(product.origin || product.servings) && (
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          {product.origin && (
            <span>
              {t("origin")}: <span className="font-medium text-fg">{product.origin}</span>
            </span>
          )}
          {product.servings && (
            <span>
              {t("servings")}: <span className="font-medium text-fg">{product.servings}</span>
            </span>
          )}
        </div>
      )}

      {product.certifications && product.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.certifications.map((c) => (
            <span key={c} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {c}
            </span>
          ))}
        </div>
      )}

      {product.inStock && (
        <SubscribeToSave
          product={product}
          mode={mode}
          intervalDays={intervalDays}
          onModeChange={setMode}
          onIntervalChange={setIntervalDays}
        />
      )}

      {/* Qty + CTAs */}
      <div id="buybox-cta" className="flex flex-col gap-3 scroll-mt-28">
        <div className="flex items-stretch gap-3">
          <div className="flex items-center rounded-full border border-line" role="group" aria-label={t("quantity")}>
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label={tp("decrease")}
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg text-fg transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              −
            </button>
            <span aria-live="polite" className="w-8 text-center font-medium tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              disabled={qty >= MAX_QTY}
              aria-label={tp("increase")}
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg text-fg transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              +
            </button>
          </div>
          <Button onClick={handleAdd} size="lg" className="flex-1" disabled={!product.inStock}>
            {!product.inStock
              ? t("outOfStock")
              : mode === "subscription"
                ? ts("addSubscription")
                : t("addToCart")}
          </Button>
        </div>

        {product.inStock && (
          <>
            <Button onClick={handleBuyNow} variant="secondary" size="lg" className="w-full">
              {t("buyNow")}
            </Button>
            {qty > 1 && (
              <p className="text-sm text-muted">
                {tp("total")}:{" "}
                <span className="font-semibold text-fg">{formatMoney(product.price * qty, locale)}</span>
              </p>
            )}
          </>
        )}
      </div>

      {!product.inStock && (
        <OutOfStockNotify productId={product.id} productName={product.name} />
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-4">
        <TrustItem label={tp("delivery")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </TrustItem>
        <TrustItem label={tp("guarantee")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </TrustItem>
        <TrustItem label={tp("secure")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" strokeLinecap="round" />
          </svg>
        </TrustItem>
      </div>

      {/*
        Only the routes the checkout can actually take. This was five provider
        pills — Payme, Click, Uzum, Visa, Mastercard — painted on every product
        page, including the ones with no merchant account behind them.
      */}
      <div>
        <p className="mb-2 text-xs text-muted">{tp("payWith")}</p>
        <div className="flex flex-wrap gap-1.5">
          {onlineProviderNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[11px] font-bold tracking-wide text-muted"
            >
              {name}
            </span>
          ))}
          <span className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[11px] font-bold tracking-wide text-muted">
            {tp("payCod")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <WishlistButton productId={product.id} className="h-10 w-10 rounded-full border border-line hover:border-danger" />
        <ShareButton name={product.name} />
      </div>

      <Disclaimer variant="product" />
    </div>
  );
}
