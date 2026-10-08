import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/*
  One band of a page.

  Every long page on this site is a stack of bands, and each one used to carry
  its own padding (py-16, py-20, py-24, py-24 sm:py-32 …) and its own idea of
  whether it sat on ink, surface-2 or brand-deep. That is what makes a page
  read as assembled rather than designed: the eye notices 96px after 128px
  after 64px even when it cannot name it.

  `tone` is the ground, `size` is the breathing room. The order is fixed:

    ink      → the default porcelain page
    surface  → a card-coloured band, used to separate two ink sections
    deep     → graphite, for the club / closing band
    none     → no background of its own (nested inside another band)

  Sections carry a hairline top border only when the tone *does not* change —
  otherwise the background shift is the separation and a line on top of it
  reads as a double rule.
*/
export function Section({
  children,
  tone = "ink",
  size = "default",
  id,
  className,
  containerClassName,
  bordered = true,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: ReactNode;
  tone?: "ink" | "surface" | "deep" | "none";
  size?: "default" | "tight";
  id?: string;
  className?: string;
  containerClassName?: string;
  bordered?: boolean;
  "aria-labelledby"?: string;
}) {
  const tones = {
    ink: "bg-legacy-ink text-fg",
    surface: "bg-surface text-fg",
    deep: "bg-brand-deep text-white",
    none: "",
  }[tone];

  const showBorder = bordered && (tone === "ink" || tone === "none");

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        size === "tight" ? "section-y-tight" : "section-y",
        tones,
        showBorder && "border-t border-legacy-line",
        className,
      )}
    >
      <div className={cn("container-px mx-auto w-full max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}
