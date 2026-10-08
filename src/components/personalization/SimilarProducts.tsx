"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/shopflow/types";
import { getSimilarProducts } from "@/lib/personalization/engine";

interface Props {
  currentProduct: Product;
  allProducts: Product[];
}

export function SimilarProducts({ currentProduct, allProducts }: Props) {
  const t = useTranslations("home.similar");

  const similar = useMemo(
    () => getSimilarProducts(currentProduct, allProducts, 6),
    [currentProduct, allProducts],
  );

  if (similar.length === 0) return null;

  return (
    <section aria-labelledby="similar-heading" className="wrap flex flex-col gap-4 pb-10 lg:gap-6 lg:pb-14">
      <h2 id="similar-heading" className="text-[22px] font-bold leading-7 lg:text-h-section">{t("title")}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
        {similar.map((p, i) => (
          <div key={p.id} className="h-full">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
