import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

/*
  Buttons (design: kit `.btn`, `.btn-l`, `.btn-o`).

  One primary colour: ink with white text, for the action of a surface —
  add to cart, checkout, the quiz's "next". `light` is the tile-grey button
  (the card's "Savatga" before anything is in the cart), `secondary` the
  outlined one for navigation and second choices, `ghost` a bare text button.
  `dark` and `gold` are kept as aliases of `primary` so older call sites
  compile; the design has no gold button.
*/
type Variant = "primary" | "light" | "secondary" | "ghost" | "dark" | "gold";
type Size = "sm" | "md" | "lg";

export function buttonVariants(variant: Variant = "primary", size: Size = "md") {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50";

  const ink = "bg-ink text-white hover:bg-black hover:text-white";
  const variants: Record<Variant, string> = {
    primary: ink,
    dark: ink,
    gold: ink,
    light: "bg-tile text-ink hover:bg-tile-hover",
    secondary: "border-[1.5px] border-line-strong bg-bg text-ink hover:border-ink",
    ghost: "text-ink hover:bg-tile",
  };

  const sizes: Record<Size, string> = {
    sm: "h-10 px-4 text-[15px]",
    md: "h-12 px-6 text-base",
    lg: "h-[52px] px-7 text-[17px]",
  };

  return cn(base, variants[variant], sizes[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants(variant, size), className)} {...props} />;
}
