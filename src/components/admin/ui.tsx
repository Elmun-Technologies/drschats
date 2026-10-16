import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Small, server-safe building blocks for the authenticated admin screens. */

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-md border border-line bg-white p-5 shadow-[0_2px_10px_rgba(23,25,27,0.035)] sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
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
        <h1 className="text-[28px] font-semibold leading-8 tracking-[-0.035em] text-ink sm:text-[32px]">{title}</h1>
        {lead && <p className="mt-2 max-w-3xl text-[13px] leading-5 text-muted sm:text-[14px]">{lead}</p>}
      </div>
      {actions}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-sm border border-line-strong bg-white px-3 text-[14px] text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus-visible:ring-2 focus-visible:ring-forest/15";
export const textareaClass =
  "min-h-24 w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-[14px] leading-6 text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus-visible:ring-2 focus-visible:ring-forest/15";
export const buttonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-forest px-5 text-[13px] font-semibold text-white transition hover:bg-[#09231a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line-strong bg-white px-4 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-tile hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20";
export const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-red/30 bg-white px-4 text-[13px] font-semibold text-red transition-colors hover:bg-red/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/20";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-4 text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-sm border px-4 py-3 text-[13px] leading-5",
        tone === "error" && "border-red/20 bg-red/5 text-red",
        tone === "ok" && "border-forest/15 bg-forest/5 text-forest",
        tone === "info" && "border-line bg-tile text-ink-2",
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
        "inline-flex min-h-6 items-center rounded-sm px-2.5 py-1 text-[10px] font-semibold leading-none",
        tone === "neutral" && "bg-tile text-ink-2",
        tone === "dark" && "bg-forest text-white",
        tone === "red" && "bg-red text-white",
      )}
    >
      {children}
    </span>
  );
}
