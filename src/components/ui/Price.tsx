import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";

/*
  Money, in one component, so the same product is priced the same way wherever
  it appears.

  The old price sits on its own line, always. It used to sit beside the current
  price inside a `flex-wrap` row, which in a two-column mobile grid wrapped
  "142 890 so'm" onto one line and "800 000 so'm" onto the next — so the two
  numbers read as two separate prices and the discount looked like a price rise
  depending on where the wrap landed. Stacking costs one line of height and
  removes the ambiguity at every width; `whitespace-nowrap` and `tabular-nums`
  keep the digits from breaking mid-number as well.
*/

export function Price({
  amount,
  oldAmount,
  locale,
  className,
  size = "md",
  align = "start",
}: {
  amount: number;
  oldAmount?: number;
  locale: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
}) {
  /*
    Fluid on the small end.

    `md` is the product-card size, and a card is 132px wide inside a two-column
    grid on a 320px phone. "1 000 000 so'm" at 20px — the old fixed size — is
    ~121px, which `whitespace-nowrap` then pushes straight out of the card
    (it looked fixed because the price no longer wrapped, but it clipped).
    15px until the two-column grid itself gets wider, then the display size.
  */
  const sizes = {
    sm: "text-[0.95rem] sm:text-base",
    md: "text-[0.95rem] sm:text-xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

  const discounted = Boolean(oldAmount && oldAmount > amount);

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center" : "items-start",
        className,
      )}
    >
      <span className={cn("whitespace-nowrap font-display font-semibold tabular-nums text-fg", sizes)}>
        {formatMoney(amount, locale)}
      </span>
      {discounted && (
        <span className="text-[0.8rem] tabular-nums text-muted line-through sm:text-sm">
          {formatMoney(oldAmount as number, locale)}
        </span>
      )}
    </div>
  );
}

/** A saving note ("−8%") in the neutral palette, never in the action colour. */
export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border border-line-strong bg-surface-2 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-deep",
        className,
      )}
    >
      −{percent}%
    </span>
  );
}
