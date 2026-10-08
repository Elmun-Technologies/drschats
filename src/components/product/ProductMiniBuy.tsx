"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { formatMoney, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { trackAddToCart } from "@/lib/analytics/events";

function useAddOne(product: Product) {
  const add = useCart((s) => s.add);
  const notify = useToast((s) => s.notify);
  return () => {
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
    notify();
  };
}

/* Desktop: the sticky card beside the description sections (design: ProductV3). */
export function ProductMiniCard({ product, image, shortName }: { product: Product; image?: string; shortName: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const addOne = useAddOne(product);
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-line bg-bg p-3.5">
      {image && (
        <span className="relative h-[72px] w-[72px] shrink-0 rounded-[14px] bg-tile">
          <Image src={image} alt="" fill sizes="72px" className="object-contain p-1.5" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm text-ink-2">{shortName}</span>
        <span className="whitespace-nowrap text-price font-bold">{formatMoney(product.price, locale)}</span>
      </div>
      {product.inStock && (
        <Button onClick={addOne} className="px-[18px]">
          {t("addToCartShort")}
        </Button>
      )}
    </div>
  );
}

/*
  Phone: the buy bar pinned above the tab bar (design: ProductMobileFirstV3).
  `position: fixed` with the `--bottom-nav` offset, never absolute; the page
  reserves its height so the footer is not covered.
*/
export function ProductBuyBar({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const addOne = useAddOne(product);
  const discounted = Boolean(product.oldPrice && product.oldPrice > product.price);
  return (
    <div data-buy-bar className="fixed inset-x-0 bottom-[var(--bottom-nav)] z-30 border-t border-line bg-bg lg:hidden">
      <div className="flex h-[var(--buy-bar)] items-center gap-3 px-4">
        <div className="flex min-w-0 flex-col">
          <span className="whitespace-nowrap text-lg font-bold leading-6">{formatMoney(product.price, locale)}</span>
          {discounted && (
            <span className="whitespace-nowrap text-sm text-muted line-through">{formatNumber(product.oldPrice as number)}</span>
          )}
        </div>
        <Button onClick={addOne} disabled={!product.inStock} size="lg" className="min-w-0 flex-1">
          {product.inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      </div>
    </div>
  );
}
