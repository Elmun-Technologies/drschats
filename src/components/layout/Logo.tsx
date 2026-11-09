import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The govita wordmark from its file (brendbook v1). Sized by height: pass an
 * `h-*` class. The link around it carries the accessible name, so the image
 * is decorative.
 */
export function Logo({
  className,
  onDark = false,
  priority = false,
}: {
  className?: string;
  onDark?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={onDark ? BRAND.logoOnDark : BRAND.logo}
      alt=""
      width={BRAND.logoWidth}
      height={BRAND.logoHeight}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}
