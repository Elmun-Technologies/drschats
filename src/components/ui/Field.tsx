import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Text input and its label (design: kit `.inp`, `.fl`). */
export const inputClass =
  "h-[52px] w-full rounded-sm border-[1.5px] border-line-strong bg-bg px-4 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-ink aria-[invalid=true]:border-red";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass, className)} {...props} />;
  },
);

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}
