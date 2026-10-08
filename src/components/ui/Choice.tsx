import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  Checkbox and radio card (design: kit `.cb`, `.opt` + `.rd`). Native inputs,
  visually replaced, so keyboard, form state and react-hook-form `register`
  work unchanged; the focus ring is drawn on the replacement. The unchecked
  border is #8A8F95 rather than the design's #A9AEB3: a control's outline
  needs 3:1 against white (WCAG 1.4.11) and the lighter grey is 2.3:1.
*/
type NativeInput = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({
  children,
  count,
  className,
  ...input
}: NativeInput & { children: ReactNode; count?: number }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] text-ink", className)}>
      <input type="checkbox" className="peer sr-only" {...input} />
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-[#8A8F95] text-white peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 [&>svg]:invisible peer-checked:[&>svg]:visible"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {count != null && <em className="text-sm not-italic text-muted">{count}</em>}
    </label>
  );
}

export function RadioCard({
  children,
  className,
  ...input
}: NativeInput & { children: ReactNode }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[14px] border-[1.5px] border-line bg-bg p-4 transition-colors has-[:checked]:border-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2",
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...input} />
      <span
        aria-hidden
        className="mt-px h-5 w-5 shrink-0 rounded-full border-[1.5px] border-[#8A8F95] peer-checked:border-[6px] peer-checked:border-ink"
      />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
