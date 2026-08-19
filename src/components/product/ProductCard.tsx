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
      className="group relative flex h-[420px] flex-col justify-end overflow-hidden rounded-[2rem] bg-brand-deep transition-all duration-500 hover:shadow-2xl hover:shadow-brand-deep/20 hover:-translate-y-1"
    >
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Cinematic Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      <div className="relative z-10 flex flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold tracking-widest text-brand-deep backdrop-blur-md">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-widest text-white backdrop-blur-md">
              {t("outOfStock")}
            </span>
          )}
          <WishlistButton productId={product.id} className="ml-auto h-8 w-8 text-white hover:text-gold" />
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.8em] text-[16px] font-bold leading-snug text-white transition-colors group-hover:text-gold">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex flex-col">
            <StarRating rating={product.rating} className="mb-1 opacity-80" />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-extrabold text-white">{formatMoney(product.price, locale)}</span>
              {product.oldPrice && (
                <span className="text-[11px] text-white/50 line-through">{formatMoney(product.oldPrice, locale)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Slide-up Add to Cart Button replacing bottom area on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-[120%] bg-brand-deep/80 backdrop-blur-md opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-bold uppercase tracking-widest text-brand-deep shadow-lg transition-all hover:bg-white disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
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
