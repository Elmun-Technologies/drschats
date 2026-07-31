"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useWishlist } from "@/lib/wishlist/store";
import type { Product } from "@/lib/shopflow/types";

/*
  Saved products are resolved against a catalogue pool passed in by the page,
  the same way RecentlyViewed and PersonalizedRail resolve theirs. The store
  holds product ids and the API has no by-ids lookup, so the pool is the only
  way to turn an id back into a product without a contract change.

  The consequence is worth naming: a saved product outside the pool cannot be
  rendered. With the current catalogue the pool covers everything; once it
  does not, this needs `getProductsByIds` on the backend rather than a bigger
  pool.
*/
export function WishlistView({ allProducts }: { allProducts: Product[] }) {
  const t = useTranslations("wishlist");
  const ids = useWishlist((s) => s.items);
  // Zustand's persist middleware hydrates on the client, so the first render
  // must not claim the list is empty — that would flash "nothing saved" at
  // someone who has saved things.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <Container className="py-10">
        <ProductGridSkeleton count={4} />
      </Container>
    );
  }

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  // Most recently saved first: the store appends, so read it backwards.
  const products = [...ids].reverse().map((id) => byId.get(id)).filter(Boolean) as Product[];

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        {products.length > 0 && (
          <p className="mt-2 text-muted">{t("count", { count: products.length })}</p>
        )}
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <p className="text-muted">{t("empty")}</p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </Container>
  );
}
