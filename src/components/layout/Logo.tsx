import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Renders the brand logo image when BRAND.logo is set, otherwise the text
 * wordmark. Drop a file in /public/brand and point BRAND.logo at it to switch.
 */
export function Logo({ className }: { className?: string }) {
  if (BRAND.logo) {
    return (
      <Image
        src={BRAND.logo}
        alt="Alimkhanov"
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
      <span className="text-accent">{BRAND.wordmark.accent}</span>
    </span>
  );
}
