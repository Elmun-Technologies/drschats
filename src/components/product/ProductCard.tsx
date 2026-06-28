"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";

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
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col rounded-xl border border-line bg-ink p-3 transition-all duration-300 hover:border-line-strong hover:shadow-[0_14px_40px_-22px_rgba(15,26,20,0.3)]"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-lg bg-surface">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-blue px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug text-fg transition-colors group-hover:text-accent-strong">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} className="mt-2" />
        <div className="mt-2 flex items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-sm text-faint line-through">{formatMoney(product.oldPrice, locale)}</span>
          )}
          <span className="font-display text-base font-bold text-accent-strong">{formatMoney(product.price, locale)}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
            <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
          </svg>
          {product.inStock ? t("addToCartShort") : t("outOfStock")}
        </button>
      </div>
    </motion.article>
  );
}
