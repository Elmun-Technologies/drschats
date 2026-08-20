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
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-brand-deep transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.6)] hover:-translate-y-1.5 border border-white/10"
    >
      {/* Light Container for Product Bottle Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2 p-6 flex items-center justify-center">
        <Link href={`/product/${product.slug}`} className="relative h-full w-full block">
          <Image
            src={product.images[0]?.url ?? ""}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          {discount > 0 ? (
            <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-deep shadow-md shadow-gold/20">
              -{discount}%
            </span>
          ) : product.badges?.[0] ? (
            <span className="rounded-full bg-brand-deep/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold border border-white/10">
              {product.badges[0]}
            </span>
          ) : null}

          {!product.inStock && (
            <span className="rounded-full bg-rose-500/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-widest text-rose-200 border border-rose-500/30">
              {t("outOfStock")}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton 
            productId={product.id} 
            className="h-9 w-9 rounded-full bg-white/80 backdrop-blur-md border border-brand-deep/10 text-brand-deep transition-all duration-300 hover:bg-white hover:scale-110 hover:text-gold shadow-md flex items-center justify-center" 
          />
        </div>
      </div>

      {/* Card Content & Permanent Add to Cart Button */}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-5 bg-brand-deep text-white">
        <div>
          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="line-clamp-2 min-h-[2.8em] font-display text-[15px] sm:text-[17px] font-bold leading-snug text-white transition-colors duration-300 group-hover/title:text-gold">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="mt-2.5 flex items-center">
            <StarRating rating={product.rating} className="opacity-90" />
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {formatMoney(product.price, locale)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-white/40 line-through decoration-white/30">
                {formatMoney(product.oldPrice, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Permanently Visible Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-lg shadow-gold/20 transition-all duration-300 hover:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
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
