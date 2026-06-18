"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
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

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(15,26,20,0.25)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges[0] && <Badge tone="accent">{product.badges[0]}</Badge>}
          {discount > 0 && <Badge tone="gold">-{discount}%</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <StarRating
          rating={product.rating}
          count={product.reviewCount}
          reviewsLabel={t("reviews", { count: product.reviewCount })}
        />
        <Link href={`/product/${product.slug}`} className="mt-2 block">
          <h3 className="font-display text-base font-bold text-fg transition-colors group-hover:text-accent-strong">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.tagline}</p>
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-sm text-faint line-through">{formatMoney(product.oldPrice, locale)}</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="mt-auto w-full rounded-full bg-accent px-4 py-3 text-sm font-bold text-ink transition-all duration-300 hover:bg-accent-strong hover:shadow-[0_10px_24px_-10px_rgba(21,182,106,0.7)] disabled:opacity-50"
        >
          {product.inStock ? `${t("addToCart")} · ${formatMoney(product.price, locale)}` : t("outOfStock")}
        </button>
      </div>
    </motion.article>
  );
}
