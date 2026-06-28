"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
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
    () => getSimilarProducts(currentProduct, allProducts, 4),
    [currentProduct, allProducts],
  );

  if (similar.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {similar.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
