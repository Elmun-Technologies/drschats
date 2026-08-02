import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Renders the brand logo image when BRAND.logo is set, otherwise the text
 * wordmark. Drop a file in /public/brand and point BRAND.logo at it to switch.
 */
export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  /** Lightens the accent half of the wordmark for the deep brand ground,
      where the standard indigo measures 2.49:1 against 3:1 required. */
  onDark?: boolean;
}) {
  if (BRAND.logo) {
    return (
      <Image
        src={BRAND.logo}
        alt="Go Vita"
        width={BRAND.logoWidth}
        height={BRAND.logoHeight}
        priority
        className={cn("h-7 w-auto", className)}
      />
    );
  }
  return (
    <span className={cn("font-display text-xl font-bold tracking-tight", className)}>
      {BRAND.wordmark.lead}
      <span className={onDark ? "text-accent-on-dark" : "text-accent"}>
        {BRAND.wordmark.accent}
      </span>
    </span>
  );
}
