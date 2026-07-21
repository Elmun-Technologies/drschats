"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { useWishlist } from "@/lib/wishlist/store";
import type { Product } from "@/lib/shopflow/types";

interface Props {
  allProducts: Product[];
}

export function WishlistView({ allProducts }: Props) {
  const [mounted, setMounted] = useState(false);
  const items = useWishlist((s) => s.items);
  const toggle = useWishlist((s) => s.toggle);
  const t = useTranslations("wishlist");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const saved = items.map((id) => byId.get(id)).filter(Boolean) as Product[];

  if (saved.length === 0) {
    return (
      <Container className="py-16 sm:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-accent-strong" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path
                d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
            {t("empty")}
          </h1>
          <p className="mt-3 text-muted">{t("emptyDesc")}</p>
          <Link href="/products" className={`mt-8 ${buttonVariants("primary", "lg")}`}>
            {t("emptyCta")}
          </Link>
        </div>
      </Container>
    );
  }

  function clearAll() {
    for (const id of [...items]) toggle(id);
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-muted">{t("count", { count: saved.length })}</p>
        <button
          onClick={clearAll}
          className="text-sm font-semibold text-muted transition-colors hover:text-danger"
        >
          {t("clearAll")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {saved.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </Container>
  );
}
