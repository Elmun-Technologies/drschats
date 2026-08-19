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
      className="group relative flex h-[440px] flex-col justify-end overflow-hidden rounded-[2.25rem] bg-brand-deep transition-all duration-700 hover:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.6)] hover:-translate-y-1.5 border border-white/10"
    >
      {/* Background image & gradient */}
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        {/* Ambient illumination glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gold/15 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        
        {/* Multi-stage cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/75 to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-90" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-brand-deep/60 opacity-60" />
      </Link>

      <div className="relative z-10 flex flex-col p-6">
        {/* Top Badges & Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {discount > 0 ? (
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-deep shadow-md shadow-gold/20">
                -{discount}%
              </span>
            ) : product.badges?.[0] ? (
              <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold border border-white/10">
                {product.badges[0]}
              </span>
            ) : null}

            {!product.inStock && (
              <span className="rounded-full bg-rose-500/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-widest text-rose-200 border border-rose-500/30">
                {t("outOfStock")}
              </span>
            )}
          </div>

          <WishlistButton 
            productId={product.id} 
            className="ml-auto h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:text-gold shadow-lg" 
          />
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="block group/title">
          <h3 className="line-clamp-2 min-h-[2.8em] font-display text-[17px] font-bold leading-snug text-white transition-colors duration-300 group-hover/title:text-gold">
            {product.name}
          </h3>
        </Link>
        
        {/* Price & Rating */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
          <div className="flex flex-col">
            <StarRating rating={product.rating} className="mb-1 opacity-90" />
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xl font-extrabold tracking-tight text-white">{formatMoney(product.price, locale)}</span>
              {product.oldPrice && (
                <span className="text-xs text-white/40 line-through decoration-white/30">{formatMoney(product.oldPrice, locale)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Slide-up Glassmorphic Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-[120%] bg-brand-deep/90 backdrop-blur-xl border-t border-white/10 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gold py-3.5 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-xl shadow-gold/20 transition-all duration-300 hover:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
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
