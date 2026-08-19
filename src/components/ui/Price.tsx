import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";

export function Price({
  amount,
  oldAmount,
  locale,
  className,
  size = "md",
}: {
  amount: number;
  oldAmount?: number;
  locale: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-display font-semibold text-fg", sizes)}>
        {formatMoney(amount, locale)}
      </span>
      {oldAmount && oldAmount > amount && (
        <span className="text-sm text-faint line-through">
          {formatMoney(oldAmount, locale)}
        </span>
      )}
    </div>
  );
}
