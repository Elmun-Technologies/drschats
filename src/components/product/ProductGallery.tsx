"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/shopflow/types";

export function ProductGallery({
  images,
  discountPercent = 0,
  inStock = true,
}: {
  images: ProductImage[];
  discountPercent?: number;
  inStock?: boolean;
}) {
  const t = useTranslations("product.gallery");
  const tc = useTranslations("common");
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

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start">
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
        className="min-w-0 flex-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <div className="relative">
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl border border-line/60 bg-gradient-to-b from-surface-2 to-surface shadow-xl"
          >
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                className="relative aspect-square w-full shrink-0 snap-center lg:aspect-[4/5] p-6 flex items-center justify-center"
                aria-hidden={i !== active}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105 p-4"
                />
              </div>
            ))}
          </div>

          {discountPercent > 0 && (
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-gold px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-brand-deep shadow-lg shadow-gold/20">
              −{discountPercent}%
            </span>
          )}

          {!inStock && (
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/90 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
              {tc("outOfStock")}
            </span>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label={t("previous")}
                className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/90 text-fg shadow-sm backdrop-blur transition-opacity hover:bg-ink disabled:pointer-events-none disabled:opacity-0 lg:flex"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                disabled={active === total - 1}
                aria-label={t("next")}
                className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/90 text-fg shadow-sm backdrop-blur transition-opacity hover:bg-ink disabled:pointer-events-none disabled:opacity-0 lg:flex"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/90 px-2.5 py-1 text-xs font-semibold text-muted shadow-sm">
                {t("counter", { index: active + 1, total })}
              </span>
            </>
          )}
        </div>

        {/* The visible dot stays 6px; the button around it is 24px square so
            a thumb can actually land on it (WCAG 2.2 target size). */}
        {total > 1 && (
          <div className="mt-3 flex justify-center lg:hidden">
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
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active ? "w-6 bg-accent" : "w-1.5 bg-surface-3",
                  )}
                />
              </button>
            ))}
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {t("counter", { index: active + 1, total })}
        </p>
      </div>

      {total > 1 && (
        <div className="hidden gap-3 lg:flex lg:w-16 lg:shrink-0 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={`thumb-${img.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t("thumb", { index: i + 1 })}
              aria-current={i === active}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                i === active ? "border-accent" : "border-line hover:border-line-strong",
              )}
            >
              <Image src={img.url} alt="" fill loading="lazy" sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
