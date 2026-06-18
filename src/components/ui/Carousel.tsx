"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap carousel with prev/next arrows. Children should be
 * `snap-start shrink-0` items with their own widths.
 */
export function Carousel({
  children,
  className,
  itemClassName,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className={cn("group relative", className)}>
      <div
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2",
          itemClassName,
        )}
      >
        {children}
      </div>

      <Arrow side="left" onClick={() => scroll(-1)} />
      <Arrow side="right" onClick={() => scroll(1)} />
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={cn(
        "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/90 text-fg shadow-lg backdrop-blur transition-all hover:border-accent hover:text-accent md:flex",
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        {side === "left" ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
