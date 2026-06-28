"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";

interface Props {
  allProducts: Product[];
}

export function RecentlyViewed({ allProducts }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useTranslations("home.recentlyViewed");

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile || profile.views.length < 2) return;

    const slugOrder = profile.views.slice(0, 8).map((v) => v.slug);
    const bySlug = new Map(allProducts.map((p) => [p.slug, p]));
    const ordered = slugOrder.map((s) => bySlug.get(s)).filter(Boolean) as Product[];
    if (ordered.length >= 2) setProducts(ordered);
  }, [allProducts]);

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
