"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart, trackViewProduct } from "@/lib/analytics/events";
import { reviewerForKey } from "@/lib/content/experts";
import type { Expert } from "@/lib/content/experts";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ShareButton } from "@/components/product/ShareButton";

function PaymentIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-surface px-2 py-1 text-[10px] font-bold tracking-wide text-muted">
      {label}
    </span>
  );
}

export function BuyBox({ product, reviewer: reviewerProp }: { product: Product; reviewer?: Expert }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tp = useTranslations("product.buyBox");
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const reviewer = reviewerProp ?? reviewerForKey(product.id, locale);

  useEffect(() => {
    trackViewProduct(product.slug, product.price);
  }, [product.slug, product.price]);

  function handleAdd() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price: product.price,
        oldPrice: product.oldPrice,
      },
      qty,
    );
    trackAddToCart(product.slug, product.price, qty);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      {product.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.badges.map((b) => (
            <Badge key={b} tone="accent">
              {b}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-2 text-base text-muted">{product.tagline}</p>
      </div>

      {/* Rating */}
      <StarRating
        rating={product.rating}
        count={product.reviewCount}
        reviewsLabel={t("reviews", { count: product.reviewCount })}
      />

      <ReviewedBy expert={reviewer} />

      {/* Price — prominent */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="lg" />
        {product.oldPrice && (
          <p className="mt-1 text-xs text-accent">
            {tp("youSave", {
              amount: new Intl.NumberFormat(locale, { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(product.oldPrice - product.price),
            })}
          </p>
        )}
      </div>

      {/* Meta */}
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

      {/* Certifications */}
      {product.certifications && product.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.certifications.map((c) => (
            <span key={c} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Qty + Add to cart */}
      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center text-lg text-fg hover:text-accent"
            aria-label="−"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-12 w-12 items-center justify-center text-lg text-fg hover:text-accent"
            aria-label="+"
          >
            +
          </button>
        </div>
        <Button onClick={handleAdd} size="lg" className="flex-1" disabled={!product.inStock}>
          {product.inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      </div>

      {!product.inStock && (
        <OutOfStockNotify productId={product.id} productName={product.name} />
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[11px] font-medium leading-tight text-fg">{tp("delivery")}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[11px] font-medium leading-tight text-fg">{tp("guarantee")}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path d="M1 10h22" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[11px] font-medium leading-tight text-fg">{tp("secure")}</p>
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <p className="mb-2 text-xs text-muted">{tp("payWith")}</p>
        <div className="flex flex-wrap gap-1.5">
          {["Payme", "Click", "Uzum", "Visa", "Mastercard"].map((p) => (
            <PaymentIcon key={p} label={p} />
          ))}
        </div>
      </div>

      {/* Wishlist + Share */}
      <div className="flex items-center gap-3 border-t border-line pt-4">
        <WishlistButton productId={product.id} className="h-10 w-10 rounded-full border border-line hover:border-red-400" />
        <ShareButton name={product.name} />
      </div>

      <Disclaimer variant="product" />
    </div>
  );
}
