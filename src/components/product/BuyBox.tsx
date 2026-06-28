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
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";

export function BuyBox({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tp = useTranslations("product.buyBox");
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const reviewer = reviewerForKey(product.id, locale);

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {product.badges.map((b) => (
          <Badge key={b} tone="accent">
            {b}
          </Badge>
        ))}
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 text-lg text-muted">{product.tagline}</p>
      </div>

      <StarRating
        rating={product.rating}
        count={product.reviewCount}
        reviewsLabel={t("reviews", { count: product.reviewCount })}
      />

      <ReviewedBy expert={reviewer} />

      <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="lg" />

      <div className="flex flex-wrap gap-4 text-sm text-muted">
        {product.origin && (
          <span>
            {t("origin")}: <span className="text-fg">{product.origin}</span>
          </span>
        )}
        {product.servings && (
          <span>
            {t("servings")}: <span className="text-fg">{product.servings}</span>
          </span>
        )}
      </div>

      {product.certifications && product.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.certifications.map((c) => (
            <span key={c} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {c}
            </span>
          ))}
        </div>
      )}

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

      <ul className="space-y-2 border-t border-line pt-6 text-sm">
        {[tp("guarantee"), tp("delivery"), tp("secure")].map((line) => (
          <li key={line} className="flex items-center gap-3 text-muted">
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {line}
          </li>
        ))}
      </ul>

      <Disclaimer variant="product" />
    </div>
  );
}
