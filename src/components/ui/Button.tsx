import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

export function buttonVariants(variant: Variant = "primary", size: Size = "md") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-ink shadow-[0_8px_22px_-14px_rgba(117,90,38,0.75)] hover:bg-accent-strong hover:text-ink hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(117,90,38,0.65)]",
    secondary:
      "border border-line-strong bg-ink text-fg hover:border-gold hover:bg-surface",
    ghost: "text-fg hover:bg-surface-2",
    gold: "bg-gold text-brand-deep shadow-[0_8px_22px_-14px_rgba(117,90,38,0.75)] hover:-translate-y-0.5 hover:bg-[#dfbc70] hover:shadow-[0_14px_28px_-14px_rgba(117,90,38,0.65)]",
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
