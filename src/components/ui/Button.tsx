import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

/*
  Variants, and the one rule they encode.

  `primary` and `gold` are the money colours: use them for actions that put
  something in the cart or complete an order ("Savatga qo'shish", "Sotib
  olish", "Rasmiylashtirish"). `secondary` and `ghost` are for navigation,
  filters and links — including "Katalogga o'tish".

  When every button is gold, none of them reads as the one that spends money.
  `gold` exists for dark backgrounds where `accent` (the antique gold used as a
  fill on light surfaces) does not carry enough weight.

  `dark` is the graphite button: the primary action of a surface that is not
  commerce — "Keyingi" in the vitamin quiz, "Katalogni ko'rish". It is the
  strongest thing on the screen without borrowing the money colour.
*/
type Variant = "primary" | "secondary" | "ghost" | "dark" | "gold";
type Size = "sm" | "md" | "lg";

export function buttonVariants(variant: Variant = "primary", size: Size = "md") {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-brand-deep shadow-[var(--shadow-cta)] hover:bg-accent-strong hover:text-ink",
    secondary:
      "border border-line-strong bg-ink text-fg hover:border-fg/30 hover:bg-surface",
    ghost: "text-fg hover:bg-surface-2",
    dark: "bg-brand-deep text-white hover:bg-fg/90",
    gold: "bg-gold text-brand-deep shadow-[var(--shadow-cta)] hover:bg-[#dfbc70]",
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return cn(base, variants[variant], sizes[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants(variant, size), className)} {...props} />
  );
}
