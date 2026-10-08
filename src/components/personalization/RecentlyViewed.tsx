"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";

interface Props {
  allProducts: Product[];
  /** The page's own product, left out of "seen" on its own page. */
  excludeSlug?: string;
}

export function RecentlyViewed({ allProducts, excludeSlug }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useTranslations("home.recentlyViewed");

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile) return;

    const bySlug = new Map(allProducts.map((p) => [p.slug, p]));
    const ordered = profile.views
      .map((v) => v.slug)
      .filter((s, i, all) => s !== excludeSlug && all.indexOf(s) === i)
      .map((s) => bySlug.get(s))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 6);
    if (ordered.length >= 2) setProducts(ordered);
  }, [allProducts, excludeSlug]);

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="wrap flex flex-col gap-4 pb-10 lg:gap-6 lg:pb-14">
      <h2 id="recent-heading" className="text-[22px] font-bold leading-7 lg:text-h-section">{t("title")}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
        {products.map((p, i) => (
          <div key={p.id} className="h-full">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
