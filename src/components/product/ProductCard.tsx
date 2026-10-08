"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { cn, formatMoney } from "@/lib/utils";
import { DiscountBadge, Price, discountPercent } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/lib/cart/store";
import { cartLineId } from "@/lib/cart/pricing";
import { trackAddToCart } from "@/lib/analytics/events";
import { WishlistButton } from "@/components/product/WishlistButton";
import { cutoutOf, unitPriceOf } from "@/lib/catalog/product-facts";

/*
  The catalogue card (design: ProductCardV3).

  Square tile-grey image block with the pack shot contained at 9% padding,
  heart top-right, "−N%" and "Xit" pills bottom-left; price, the per-unit
  price (its line is kept even when empty so a row of cards stays aligned),
  a two-line name, the delivery promise and, at the bottom, "Savatga" — which
  turns into a quantity stepper once the product is in the cart.

  "Xit" shows only when the catalogue itself says bestseller; the design's
  sample data is not a source of claims.
*/
const HIT_BADGES = new Set(["Bestseller", "Хит продаж", "Xit", "Хит"]);

export function ProductCard({
  product,
  index = 0,
  onCard = false,
}: {
  product: Product;
  index?: number;
  /** White card with its own padding, for rails set on a dark panel. */
  onCard?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const lineId = cartLineId(product.id);
  const qty = useCart((s) => s.lines.find((l) => l.lineId === lineId)?.quantity ?? 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const href = `/product/${product.slug}`;
  const image = cutoutOf(product) ?? product.images[0]?.url;
  const discount = discountPercent(product.price, product.oldPrice);
  const hit = product.badges?.some((b) => HIT_BADGES.has(b));
  const perUnit = unitPriceOf(product);
  const inCart = mounted && qty > 0;

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price: product.price,
      oldPrice: product.oldPrice,
    });
    trackAddToCart(product.slug, product.price, 1);
  }

  return (
    <Reveal
      as="article"
      index={index % 4}
      className={cn(
        "group flex h-full flex-col gap-1.5 text-ink",
        onCard && "rounded-[20px] bg-bg px-2.5 pb-3.5 pt-2.5",
      )}
    >
      <div className="relative">
        <Link
          href={href}
          aria-label={product.name}
          className="relative block aspect-square overflow-hidden rounded-[16px] bg-tile"
        >
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 232px"
              className="object-contain p-[9%] transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center p-4 text-center text-[13px] text-muted">
              {product.name}
            </span>
          )}
        </Link>

        <WishlistButton
          productId={product.id}
          className="absolute right-2 top-2 h-9 w-9 bg-bg shadow-[0_1px_4px_rgba(23,25,27,0.08)]"
        />

        {(discount > 0 || hit || !product.inStock) && (
          <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1">
            <DiscountBadge percent={discount} />
            {hit && <Badge tone="hit" className="h-6 px-[9px] text-[13px]">{t("hit")}</Badge>}
            {!product.inStock && <Badge className="h-6 px-[9px]">{t("outOfStock")}</Badge>}
          </div>
        )}
      </div>

      <Price
        amount={product.price}
        oldAmount={product.oldPrice}
        locale={locale}
        layout="inline"
        className="px-0.5 pt-1.5"
      />
      <span className="-mt-1 min-h-[17px] px-0.5 text-caption text-muted">
        {perUnit &&
          t("perUnit", {
            price: formatMoney(perUnit.amount, locale),
            unit: t(perUnit.unit === "tablet" ? "unitTablet" : "unitCapsule"),
          })}
      </span>
      <Link href={href} className="line-clamp-2 min-h-10 px-0.5 text-card-title text-ink-2 hover:text-ink">
        {product.name}
      </Link>
      <span className="flex items-center gap-1.5 px-0.5 text-caption text-muted">
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
        {t("delivery24")}
      </span>

      <div className="mt-auto pt-1.5">
        {inCart ? (
          <div className="flex h-11 items-center justify-between rounded-sm bg-ink text-white">
            <button
              type="button"
              onClick={() => setQuantity(lineId, qty - 1)}
              aria-label={t("decrease")}
              className="flex h-11 w-11 items-center justify-center text-xl"
            >
              −
            </button>
            <span className="text-[15px] font-semibold" aria-live="polite">
              {t("inCartQty", { count: qty })}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(lineId, qty + 1)}
              aria-label={t("increase")}
              className="flex h-11 w-11 items-center justify-center text-xl"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-tile text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-tile"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {product.inStock ? t("addToCartShort") : t("outOfStock")}
          </button>
        )}
      </div>
    </Reveal>
  );
}
