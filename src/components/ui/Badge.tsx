import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/*
  Pills (design: kit `.b-soft`, `.b-sale`, `.b-hit`).

  Red is the sale colour and yellow is "Xit" / "Arzon narx kafolati" — nothing
  else. `accent` and `gold` stay as aliases of the neutral pill so existing
  call sites keep compiling; `danger` is for stock and error notes, drawn as
  red text on a pale ground so it never reads as a discount.
*/
export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent" | "gold" | "danger" | "sale" | "hit";
}) {
  const tones = {
    default: "bg-chip-strong text-ink",
    accent: "bg-chip-strong text-ink",
    gold: "bg-chip-strong text-ink",
    danger: "bg-red/10 text-red",
    sale: "bg-red font-bold text-white",
    hit: "bg-yellow font-bold text-ink",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center whitespace-nowrap rounded-pill px-2.5 text-[13px] font-semibold",
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}
