import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent" | "gold" | "danger";
}) {
  /*
    `accent` and `gold` both used to paint a gold-tinted pill. That made every
    product tag ("Yangi", "Xit"), every blog category and every trust chip the
    same colour as the buy button — so the one colour that means "spend money
    here" was on screen a dozen times before the shopper reached a price. Both
    tones are now neutral; `gold` is kept as an alias so call sites that mean
    "this was a promotional label" still compile and read the same.
  */
  const tones = {
    default: "border-legacy-line-strong bg-surface-2 text-legacy-muted",
    accent: "border-legacy-line bg-surface-2 text-legacy-muted",
    gold: "border-legacy-line bg-surface-2 text-legacy-muted",
    danger: "border-danger/30 bg-danger/10 text-danger",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}
