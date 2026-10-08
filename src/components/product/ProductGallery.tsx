"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DiscountBadge } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import type { ProductImage } from "@/lib/shopflow/types";

/*
  Design: ProductV3 gallery — 76px thumbnails on the left, the shot on a tile
  square. Phones (ProductMobileV3): a swipeable square with a "1 / 3" counter
  and dots. The first image is the cut-out pack shot when one exists, drawn at
  80% like the cards; the photos after it fill the tile.
*/
export function ProductGallery({
  images,
  cutout = false,
  discountPercent = 0,
  guaranteeLabel,
  outOfStockLabel,
}: {
  images: ProductImage[];
  /** The first image is a transparent cut-out, not a photo. */
  cutout?: boolean;
  discountPercent?: number;
  guaranteeLabel?: string;
  outOfStockLabel?: string;
}) {
  const t = useTranslations("product.gallery");
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, total - 1));
      setActive(next);
      const track = trackRef.current;
      if (track) track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [total],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      setActive((prev) => (prev === index ? prev : index));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (total === 0) return null;

  const isCutout = (i: number) => cutout && i === 0;

  return (
    <div className="flex gap-3">
      {total > 1 && (
        <div className="hidden shrink-0 flex-col gap-2.5 lg:flex">
          {images.map((img, i) => (
            <button
              key={`thumb-${img.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t("thumb", { index: i + 1 })}
              aria-current={i === active}
              className={cn(
                "relative h-[76px] w-[76px] overflow-hidden rounded-[14px] border-2 bg-tile transition-colors",
                i === active ? "border-ink" : "border-transparent hover:border-line-strong",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                loading="lazy"
                sizes="76px"
                className={isCutout(i) ? "object-contain p-1.5" : "object-cover"}
              />
            </button>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={t("label")}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(active + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(active - 1);
          }
        }}
        className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        <div className="relative">
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl bg-tile"
          >
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                className="relative aspect-square w-full shrink-0 snap-center"
                aria-hidden={i !== active}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={isCutout(i) ? "object-contain p-[9%] lg:p-[10%]" : "object-cover"}
                />
              </div>
            ))}
          </div>

          {(discountPercent > 0 || guaranteeLabel || outOfStockLabel) && (
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 lg:left-4 lg:top-4">
              <DiscountBadge percent={discountPercent} className="h-[26px] px-2.5 text-sm" />
              {guaranteeLabel && <Badge tone="hit" className="text-sm">{guaranteeLabel}</Badge>}
              {outOfStockLabel && <Badge className="text-sm">{outOfStockLabel}</Badge>}
            </div>
          )}

          {total > 1 && (
            <>
              <ArrowButton side="left" label={t("previous")} disabled={active === 0} onClick={() => goTo(active - 1)} />
              <ArrowButton side="right" label={t("next")} disabled={active === total - 1} onClick={() => goTo(active + 1)} />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-[12px] bg-bg px-2.5 py-1 text-[13px] font-semibold tabular-nums lg:hidden">
                {t("counter", { index: active + 1, total })}
              </span>
            </>
          )}
        </div>

        {/* The visible dot stays 6px; the button around it is 24px square so
            a thumb can actually land on it (WCAG 2.2 target size). */}
        {total > 1 && (
          <div className="flex justify-center lg:hidden">
            {images.map((img, i) => (
              <button
                key={`dot-${img.url}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={t("thumb", { index: i + 1 })}
                aria-current={i === active}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  aria-hidden
                  className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-ink" : "w-1.5 bg-on-dark-2")}
                />
              </button>
            ))}
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {t("counter", { index: active + 1, total })}
        </p>
      </div>
    </div>
  );
}

function ArrowButton({
  side,
  label,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-bg text-ink shadow-arrow transition-opacity disabled:pointer-events-none disabled:opacity-0 lg:flex",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
