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
      className="group relative flex h-full flex-col rounded-3xl border border-line/50 bg-ink p-3 transition-all duration-500 hover:border-gold/30 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] hover:-translate-y-1 overflow-hidden"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface/50 mix-blend-multiply">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[4px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wider text-muted shadow-sm">
              {t("outOfStock")}
            </span>
          </div>
        )}
        <WishlistButton productId={product.id} className="absolute right-2 top-2 h-8 w-8 bg-surface/80 backdrop-blur-sm" />
      </Link>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.8em] text-[15px] font-bold leading-snug text-brand-deep transition-colors group-hover:text-gold-ink">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-3">
          <StarRating rating={product.rating} className="mb-2" />
          <div className="flex items-baseline gap-2">
            {product.oldPrice && (
              <span className="text-xs text-faint line-through">{formatMoney(product.oldPrice, locale)}</span>
            )}
            <span className="font-display text-lg font-extrabold text-brand-deep">{formatMoney(product.price, locale)}</span>
          </div>
        </div>

        {/* Slide-up Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-[120%] opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gold-ink disabled:bg-surface disabled:text-muted disabled:shadow-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
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
