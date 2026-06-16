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
  const tones = {
    default: "border-line-strong bg-surface-2 text-muted",
    accent: "border-accent/30 bg-accent-soft text-accent",
    gold: "border-gold/30 bg-gold/10 text-gold",
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
