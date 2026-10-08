"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Review } from "@/lib/shopflow/types";
import { StarRating } from "@/components/ui/StarRating";

const INITIAL_COUNT = 4;

export function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const index = Math.min(4, Math.max(0, Math.round(r.rating) - 1));
      buckets[index] += 1;
    }
    return buckets;
  }, [reviews]);

  if (reviews.length === 0) return null;

  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
      <div className="rounded-2xl border border-line bg-bg p-6 lg:sticky lg:top-24">
        <p className="text-4xl font-bold leading-none text-ink">{rating.toFixed(1)}</p>
        <StarRating rating={rating} className="mt-3" />
        <p className="mt-2 text-sm text-ink-2">{tc("reviews", { count: reviewCount })}</p>

        <div className="mt-5 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1];
            const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-ink-2">
                <span className="w-3 tabular-nums">{star}</span>
                <svg viewBox="0 0 20 20" aria-hidden className="h-3 w-3 fill-ink">
                  <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
                </svg>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tile-hover">
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-8 text-right tabular-nums">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((r, i) => (
            <li key={`${r.author}-${i}`}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-bg p-6">
                <div className="flex items-center justify-between gap-3">
                  <StarRating rating={r.rating} />
                  {r.date && <time className="text-xs text-muted">{r.date}</time>}
                </div>
                <blockquote className="mt-4 flex-1 text-ink-2">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-4 flex items-center gap-2 text-sm font-medium text-ink">
                  {r.author}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink">
                    <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t("verifiedBuyer")}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {reviews.length > INITIAL_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-6 w-full rounded-full border border-line-strong bg-tile py-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {expanded ? t("showLessReviews") : t("showMoreReviews", { count: reviews.length - INITIAL_COUNT })}
          </button>
        )}
      </div>
    </div>
  );
}
