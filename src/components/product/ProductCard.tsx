"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";
import { WishlistButton } from "@/components/product/WishlistButton";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const add = useCart((s) => s.add);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price: product.price,
      oldPrice: product.oldPrice,
    });
    trackAddToCart(product.slug, product.price, 1);
  }

  return (
    <Reveal
      as="article"
      index={index % 4}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-line/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-gold/50"
    >
      {/* Light Clean Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2/60 p-5 flex items-center justify-center">
        <Link href={`/product/${product.slug}`} className="relative h-full w-full block">
          <Image
            src={product.images[0]?.url ?? ""}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          {discount > 0 ? (
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-deep shadow-xs">
              -{discount}%
            </span>
          ) : product.badges?.[0] ? (
            <span className="rounded-full bg-brand-deep px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {product.badges[0]}
            </span>
          ) : null}

          {!product.inStock && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
              {t("outOfStock")}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton 
            productId={product.id} 
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs border border-line/60 text-brand-deep transition-all duration-300 hover:bg-gold hover:border-gold hover:text-brand-deep hover:scale-105 shadow-xs flex items-center justify-center" 
          />
        </div>
      </div>

      {/* Clean White Body Content & Permanent Buy CTA */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-surface text-fg">
        <div>
          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="line-clamp-2 min-h-[2.6em] font-display text-sm font-bold leading-snug text-fg transition-colors duration-200 group-hover/title:text-gold-ink sm:text-base">
              {product.name}
            </h3>
          </Link>

          {/* Small sourcing cue and one concise benefit mirror the catalogue
              reading pattern: shoppers can scan provenance before price. */}
          {(product.origin || product.highlights[0]) && (
            <div className="mt-2 min-h-9">
              {product.origin && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 text-gold-ink" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0Z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {product.origin}
                </span>
              )}
              {product.highlights[0] && (
                <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-muted">{product.highlights[0]}</p>
              )}
            </div>
          )}

          {/* Star Rating & Servings */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <StarRating rating={product.rating} className="scale-90 origin-left" />
            {product.servings && (
              <span className="text-[11px] font-semibold text-brand-deep bg-gold/15 px-2 py-0.5 rounded-md">
                {tp("servingsLabel", { count: product.servings })}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-fg">
              {formatMoney(product.price, locale)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-muted line-through font-medium">
                {formatMoney(product.oldPrice, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Permanent High-Contrast Add to Cart Button */}
        <div className="mt-3.5 pt-3 border-t border-line/50">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deep shadow-[0_8px_18px_-14px_rgba(117,90,38,0.75)] transition-all duration-300 hover:bg-accent-strong hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
              <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
            </svg>
            {product.inStock ? t("addToCartShort") : t("outOfStock")}
          </button>
        </div>
      </div>
    </Reveal>
  );
}
