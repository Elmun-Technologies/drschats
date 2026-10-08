import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Small, server-safe building blocks for the admin screens. */

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[20px] bg-bg p-5 lg:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, lead, actions }: { title: string; lead?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold leading-8">{title}</h1>
        {lead && <p className="mt-1 text-[15px] text-ink-2">{lead}</p>}
      </div>
      {actions}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-sm border border-line-strong bg-bg px-3 text-[15px] outline-none transition-colors focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";
export const textareaClass =
  "min-h-24 w-full rounded-sm border border-line-strong bg-bg px-3 py-2.5 text-[15px] leading-6 outline-none transition-colors focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";
export const buttonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-ink px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line-strong bg-bg px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-tile";
export const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-red/40 bg-bg px-5 text-[15px] font-semibold text-red transition-colors hover:bg-red/5";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-sm px-4 py-3 text-[15px]",
        tone === "error" && "bg-red/10 text-red",
        tone === "ok" && "bg-tile text-ink",
        tone === "info" && "bg-tile text-ink-2",
      )}
    >
      {children}
    </p>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "dark" | "red" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[13px] font-semibold",
        tone === "neutral" && "bg-tile text-ink-2",
        tone === "dark" && "bg-ink text-white",
        tone === "red" && "bg-red text-white",
      )}
    >
      {children}
    </span>
  );
}
