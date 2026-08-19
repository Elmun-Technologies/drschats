import { cn } from "@/lib/utils";

/** Infinite horizontal marquee using a pure-CSS animation (no JS needed). */
export function Marquee({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const items = Array.from({ length: 4 });
  return (
    <div
      className={cn(
        "relative flex overflow-hidden border-y border-line py-4",
        className,
      )}
    >
      <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
        {items.map((_, i) => (
          <span
            key={i}
            className="text-sm font-medium uppercase tracking-[0.2em] text-muted"
          >
            {text}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8"
      >
        {items.map((_, i) => (
          <span
            key={i}
            className="text-sm font-medium uppercase tracking-[0.2em] text-muted"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
