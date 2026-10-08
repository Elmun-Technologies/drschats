"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string;
  /** Background-removed pack shot: contained on the tile ground. A photo fills the frame. */
  cutout?: boolean;
}

/*
  Product gallery (design: ProductV3 / ProductMobileV3).

  One snap-scroll track for both layouts, so a swipe on a phone and an arrow
  or thumbnail on a desktop move the same state. Desktop: vertical thumbnails
  on the left and arrows over the image; phone: dots and a "1 / 3" counter.
  Badges sit top-left over the image and are passed in by the page.
*/
export function ProductGallery({
  images,
  badges,
}: {
  images: GalleryImage[];
  badges?: ReactNode;
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

  return (
    <div className="flex gap-3">
      {total > 1 && (
        <div className="hidden w-[76px] shrink-0 flex-col gap-2.5 lg:flex">
          {images.map((img, i) => (
            <button
              key={`thumb-${img.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t("thumb", { index: i + 1 })}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-[14px] border-[1.5px] bg-tile transition-colors",
                i === active ? "border-ink" : "border-transparent hover:border-line-strong",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                loading="lazy"
                sizes="76px"
                className={img.cutout ? "object-contain p-2" : "object-cover"}
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
        className="min-w-0 flex-1 rounded-3xl"
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
                  className={img.cutout ? "object-contain p-[10%]" : "object-cover"}
                />
              </div>
            ))}
          </div>

          {badges && (
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 lg:left-4 lg:top-4">
              {badges}
            </div>
          )}

          {total > 1 && (
            <>
              <ArrowButton side="left" label={t("previous")} disabled={active === 0} onClick={() => goTo(active - 1)} />
              <ArrowButton side="right" label={t("next")} disabled={active === total - 1} onClick={() => goTo(active + 1)} />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-3 right-3 rounded-pill bg-bg px-3 py-1 text-sm font-semibold text-ink lg:hidden"
              >
                {t("counter", { index: active + 1, total })}
              </span>
            </>
          )}
        </div>

        {/* The visible dot stays 6px; the button around it is 24px square so
            a thumb can actually land on it (WCAG 2.2 target size). */}
        {total > 1 && (
          <div className="mt-2 flex justify-center lg:hidden">
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
                  className={cn("h-1.5 rounded-pill transition-all", i === active ? "w-5 bg-ink" : "w-1.5 bg-line-strong")}
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
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
