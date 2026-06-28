"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";

export function StickyBuyBar({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const add = useCart((s) => s.add);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleAdd() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price: product.price,
        oldPrice: product.oldPrice,
      },
      1,
    );
    trackAddToCart(product.slug, product.price, 1);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ink/95 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <p className="flex-1 truncate text-sm font-semibold text-fg">{product.name}</p>
        <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="sm" />
        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition-all hover:bg-accent-strong disabled:opacity-50"
        >
          {product.inStock ? t("addToCart") : t("outOfStock")}
        </button>
      </div>
    </div>
  );
}
