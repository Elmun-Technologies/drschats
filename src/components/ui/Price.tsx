import { cn, formatMoney, formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";

/*
  Money, in one component, so the same product is priced the same way wherever
  it appears (design: kit — price bold ink, the reference price struck through
  in muted).

  `layout="inline"` is the card form: price and old price on one baseline,
  wrapping as a pair, the old one without the currency as in the design.
  No tabular-nums: Onest's tabular figures are visibly wider than the design. `stack` keeps the old price on its own line for the
  narrow places (cart lines, drawers) where a wrap would split the two numbers
  into what reads as two prices.
*/
export function Price({
  amount,
  oldAmount,
  locale,
  className,
  size = "md",
  align = "start",
  layout = "stack",
}: {
  amount: number;
  oldAmount?: number;
  locale: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  layout?: "stack" | "inline";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-lg sm:text-price",
    lg: "text-[28px] leading-9 sm:text-price-l",
  }[size];

  const discounted = Boolean(oldAmount && oldAmount > amount);

  return (
    <div
      className={cn(
        "flex",
        layout === "inline" ? "flex-wrap items-baseline gap-x-2" : "flex-col",
        layout === "stack" && (align === "center" ? "items-center" : "items-start"),
        className,
      )}
    >
      <span className={cn("whitespace-nowrap font-bold text-ink", sizes)}>
        {formatMoney(amount, locale)}
      </span>
      {discounted && (
        <span className="whitespace-nowrap text-sm text-muted line-through">
          {layout === "inline" ? formatNumber(oldAmount as number) : formatMoney(oldAmount as number, locale)}
        </span>
      )}
    </div>
  );
}

export function discountPercent(price: number, oldPrice?: number): number {
  return oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
}

/** "−11%" — the red pill, the only place the sale colour is allowed. */
export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center whitespace-nowrap rounded-pill bg-red px-[9px] text-[13px] font-bold text-white",
        className,
      )}
    >
      −{percent}%
    </span>
  );
}
