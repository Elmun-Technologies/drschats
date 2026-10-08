import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Renders the brand logo image when BRAND.logo is set, otherwise the
 * Playfair wordmark. The wordmark is drawn, not read: it is aria-hidden and
 * the link around it carries the name, which is also what keeps the gold "v"
 * (a logotype, exempt from WCAG 1.4.3) out of the contrast audit.
 */
export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
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
    <span
      aria-hidden
      className={cn(
        "font-logo font-medium leading-none tracking-[-0.02em]",
        onDark ? "text-white" : "text-forest",
        className,
      )}
    >
      {BRAND.wordmark.lead}
      <span className="text-gold">{BRAND.wordmark.accent}</span>
      {BRAND.wordmark.tail}
    </span>
  );
}
