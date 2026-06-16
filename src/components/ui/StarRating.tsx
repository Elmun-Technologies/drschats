import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  className,
  reviewsLabel,
}: {
  rating: number;
  count?: number;
  className?: string;
  reviewsLabel?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={cn(
              "h-4 w-4",
              i < Math.round(rating) ? "fill-gold" : "fill-surface-3",
            )}
          >
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-fg">{rating.toFixed(1)}</span>
      {count != null && reviewsLabel && (
        <span className="text-sm text-faint">({count})</span>
      )}
    </div>
  );
}
