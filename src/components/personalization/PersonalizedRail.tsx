"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";
import { getRecommendations } from "@/lib/personalization/engine";

interface Props {
  allProducts: Product[];
  excludeSlugs?: string[];
}

export function PersonalizedRail({ allProducts, excludeSlugs = [] }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useTranslations("home.forYou");

  useEffect(() => {
    const profile = getUserProfile();
    // Need at least 2 views to start personalizing
    if (!profile || profile.views.length < 2) return;

    const recs = getRecommendations(allProducts, profile, excludeSlugs, 8);
    if (recs.length >= 2) setProducts(recs);
  }, [allProducts, excludeSlugs]);

  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-2 text-muted">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
