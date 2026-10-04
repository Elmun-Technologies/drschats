"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { StarRating } from "@/components/ui/StarRating";
import { DiscountBadge, Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";
import { WishlistButton } from "@/components/product/WishlistButton";

/*
  The catalogue card.

  Layout rules it now follows, after the client's catalogue pass:

  - **One ground.** The photo tile and the text block are the same surface
    colour, so a card is one object rather than a picture sitting on a plate.
    The photo keeps a hairline and a slightly recessed tone inside the card,
    which is what separates image from copy without a second surface.
  - **Nothing floats.** Badges, the wishlist button and the CTA all sit on the
    card grid: image inset 12px on mobile, 16px from sm.
  - **Two lines of title, always.** A fixed title block keeps the prices in a
    row aligned across the grid — ragged card heights are what make a grid look
    like it lost a column.
  - **Money in one place.** Price (fluid, see ui/Price) and the struck-through
    reference price under it; the CTA is the only gold element.
*/
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const add = useCart((s) => s.add);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all duration-300 hover:border-line-strong hover:shadow-[var(--shadow-card)]"
    >
      {/* Photo */}
      <div className="relative aspect-square w-full p-3 sm:p-4">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-surface-2/70">
          <Link
            href={`/product/${product.slug}`}
            className="relative block h-full w-full"
            aria-label={product.name}
          >
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              /* Never an empty <img>, and never another product's picture. */
              <span className="flex h-full w-full items-center justify-center p-3 text-center">
                <span className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 text-faint" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span className="line-clamp-2 text-[11px] font-semibold text-faint">{product.name}</span>
                </span>
              </span>
            )}
          </Link>

          {/* Badges — discount first; a second badge only if there is room. */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-2.5rem)] flex-wrap items-center gap-1.5">
            {discount > 0 ? (
              <DiscountBadge percent={discount} />
            ) : product.badges?.[0] ? (
              <span className="rounded-full border border-line-strong bg-ink/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted backdrop-blur-xs">
                {product.badges[0]}
              </span>
            ) : null}

            {!product.inStock && (
              <span className="rounded-full border border-danger/25 bg-danger/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger">
                {t("outOfStock")}
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5 z-10">
            <WishlistButton
              productId={product.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink/90 text-fg shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-line-strong hover:text-danger"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4">
        <Link href={`/product/${product.slug}`} className="group/title">
          <h3 className="line-clamp-2 min-h-[2.5em] font-display text-sm font-bold leading-snug text-fg transition-colors duration-200 group-hover/title:text-signal sm:text-[0.95rem]">{product.name}
          </h3>
        </Link>

        {/* One metadata line: origin, then the first highlight. Never both
            large — at 320px two wrapped lines of grey push the price below the
            fold of the card. */}
        <div className="mt-1.5 min-h-[1.15rem] text-[11px] leading-tight text-muted">
          {product.origin && (
            <span className="inline-flex items-center gap-1 font-semibold">
              <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {product.origin}
            </span>
          )}
          {product.origin && product.highlights[0] && <span aria-hidden> · </span>}
          {product.highlights[0] && <span className="line-clamp-1 inline">{product.highlights[0]}</span>}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <StarRating rating={product.rating} className="origin-left scale-90" />
          {product.servings && (
            <span className="truncate rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
              {product.servings}
            </span>
          )}
        </div>

        <Price
          className="mt-2.5"
          amount={product.price}
          oldAmount={product.oldPrice}
          locale={locale}
        />

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-deep shadow-[var(--shadow-cta)] transition-all duration-300 hover:bg-accent-strong hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:shadow-none sm:text-xs"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
            <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
          </svg>
          {product.inStock ? t("addToCartShort") : t("outOfStock")}
        </button>
      </div>
    </Reveal>
  );
}
