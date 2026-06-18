"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const add = useCart((s) => s.add);

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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:border-line-strong hover:shadow-[0_14px_40px_-22px_rgba(15,26,20,0.3)]"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        {product.badges[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg shadow-sm backdrop-blur">
            {product.badges[0]}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <StarRating rating={product.rating} count={product.reviewCount} reviewsLabel={t("reviews", { count: product.reviewCount })} />
        <Link href={`/product/${product.slug}`} className="mt-2 block">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-fg transition-colors group-hover:text-accent-strong">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted">{product.tagline}</p>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="sm" />
          <button
            onClick={handleAdd}
            aria-label={t("addToCart")}
            disabled={!product.inStock}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-all duration-300 hover:bg-accent-strong disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
