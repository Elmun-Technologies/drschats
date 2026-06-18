"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_28px_70px_-28px_rgba(31,209,123,0.4)]"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-surface-2">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
        {product.badges[0] && (
          <div className="absolute left-3 top-3">
            <Badge tone="accent">{product.badges[0]}</Badge>
          </div>
        )}
        {product.oldPrice && (
          <div className="absolute right-3 top-3">
            <Badge tone="gold">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <StarRating rating={product.rating} count={product.reviewCount} reviewsLabel={t("reviews", { count: product.reviewCount })} />
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-display text-lg font-semibold text-fg transition-colors group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.tagline}</p>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} />
          <button
            onClick={handleAdd}
            aria-label={t("addToCart")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-all duration-300 hover:scale-110 hover:bg-accent-strong"
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
