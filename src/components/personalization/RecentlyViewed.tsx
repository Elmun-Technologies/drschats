"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";

/** Products this browser looked at before, newest first; hidden below two. */
export function RecentlyViewed({
  allProducts,
  title,
  excludeSlug,
}: {
  allProducts: Product[];
  title: string;
  excludeSlug?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

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
    <section aria-labelledby="recently-viewed" className="wrap flex flex-col gap-3.5 lg:gap-6">
      <h2 id="recently-viewed" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
        {title}
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6 md:overflow-visible md:px-0">
        {products.map((p, i) => (
          <div key={p.id} className="h-full w-40 shrink-0 md:w-auto">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
