import Link from "next/link";
import type { ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";

/*
  Admin building blocks, drawn with the storefront's V3 tokens: white page,
  `tile` panels, ink primary buttons, 12px controls and 20px cards. No green —
  forest and gold stay in the logo, exactly as on the site.
*/

export function Card({ title, lead, actions, children, className, id }: { title?: string; lead?: string; actions?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("min-w-0 rounded-[20px] border border-line bg-white p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[18px] font-bold leading-6 text-ink">{title}</h2>}
            {lead && <p className="mt-1 text-[13px] leading-5 text-muted">{lead}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, lead, eyebrow, actions }: { title: string; lead?: ReactNode; eyebrow?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[14px] text-muted">{eyebrow}</p>}
        <h1 className="text-[28px] font-bold leading-[34px] text-ink lg:text-[36px] lg:leading-[42px]">{title}</h1>
        {lead && <p className="mt-2 max-w-3xl text-[15px] leading-[23px] text-ink-2">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3 first:mt-0">
      <h2 className="text-[22px] font-bold leading-7 text-ink">{children}</h2>
      {actions}
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-[12px] border border-line-strong bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/15";
export const textareaClass =
  "min-h-24 w-full rounded-[12px] border border-line-strong bg-white px-3.5 py-3 text-[15px] leading-6 text-ink outline-none transition placeholder:text-muted focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/15";
export const buttonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-ink px-5 text-[15px] font-semibold text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-tile px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";
export const smallButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-tile px-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";
export const dangerButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-red/30 bg-white px-4 text-[15px] font-semibold text-red transition-colors hover:bg-red/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/20";
export const linkClass = "font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-[4px]";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="text-[13px] leading-[17px] text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[12px] px-4 py-3 text-[14px] leading-5",
        tone === "error" && "border border-red/25 bg-white text-red",
        tone === "ok" && "bg-ink text-white",
        tone === "info" && "bg-tile text-ink-2",
      )}
    >
      {children}
    </p>
  );
}

export type PillTone = "neutral" | "dark" | "outline" | "red" | "yellow" | "muted";

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: PillTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none",
        tone === "neutral" && "bg-chip-strong text-ink",
        tone === "dark" && "bg-ink text-white",
        tone === "outline" && "border border-line-strong bg-white text-ink",
        tone === "red" && "bg-red text-white",
        tone === "yellow" && "bg-yellow text-ink",
        tone === "muted" && "bg-tile text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Filter chips as links: the active one is ink, the rest tile — the site's tab look. */
export function ChipNav({ label, items, className }: { label: string; items: { href: string; label: ReactNode; active: boolean; count?: number }[]; className?: string }) {
  return (
    <nav aria-label={label} className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-[12px] px-4 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
            item.active ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover",
          )}
        >
          {item.label}
          {item.count !== undefined && <span className={cn("text-[13px] tabular-nums", item.active ? "text-on-dark-2" : "text-muted")}>{formatNumber(item.count)}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** A KPI tile. `delta` compares with the previous period of the same length. */
export function Metric({ label, value, hint, delta, href }: { label: string; value: ReactNode; hint?: ReactNode; delta?: { current: number; previous: number }; href?: string }) {
  const change = delta && delta.previous > 0 ? Math.round(((delta.current - delta.previous) / delta.previous) * 100) : null;
  const body = (
    <>
      <p className="text-[14px] font-medium leading-5 text-ink-2">{label}</p>
      <p className="mt-2 text-[22px] font-bold leading-7 tabular-nums text-ink lg:text-[26px] lg:leading-8">{value}</p>
      <p className="mt-1.5 flex min-h-5 flex-wrap items-center gap-x-2 text-[13px] text-muted">
        {change !== null && (
          <span className={cn("font-semibold tabular-nums", change >= 0 ? "text-ink" : "text-ink-2")}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
        {hint}
      </p>
    </>
  );
  const className = "block min-w-0 rounded-[20px] bg-tile p-5";
  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30")}>{body}</Link>
  ) : (
    <section className={className}>{body}</section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[16px] bg-tile px-5 py-8 text-center">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-xl text-[14px] leading-5 text-muted">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Horizontal bars for a ranked list (channels, products). Values share one scale. */
export function BarList({ rows, format = formatNumber, empty = "Maʼlumot yoʻq" }: { rows: { label: ReactNode; value: number; note?: ReactNode; href?: string }[]; format?: (n: number) => string; empty?: string }) {
  if (rows.length === 0) return <p className="rounded-[12px] bg-tile px-4 py-5 text-center text-[14px] text-muted">{empty}</p>;
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row, index) => {
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-[14px]">
              <span className="min-w-0 truncate font-medium text-ink">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">{format(row.value)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tile">
              <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(2, Math.round((row.value / max) * 100))}%` }} />
            </div>
            {row.note && <p className="mt-1 text-[13px] text-muted">{row.note}</p>}
          </>
        );
        return <li key={index}>{row.href ? <Link href={row.href} className="block rounded-[8px] hover:opacity-80">{inner}</Link> : inner}</li>;
      })}
    </ul>
  );
}

export const tableClass = "w-full min-w-[640px] border-separate border-spacing-0 text-left text-[14px]";
export const thClass = "border-b border-line px-3 pb-3 text-[13px] font-semibold text-muted first:pl-0 last:pr-0";
export const tdClass = "border-b border-line px-3 py-3.5 align-middle text-ink first:pl-0 last:pr-0";

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">{children}</div>;
}

export function som(value: number): string {
  return `${formatNumber(Math.round(value))} soʻm`;
}

const RELATIVE = new Intl.RelativeTimeFormat("uz", { numeric: "auto" });

/** "3 soat oldin" — the panel speaks in how long ago, the tooltip has the exact time. */
export function timeAgo(date: Date | null | undefined, now = Date.now()): string {
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "hozirgina";
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return RELATIVE.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 45) return RELATIVE.format(Math.round(seconds / 86400), "day");
  if (abs < 86400 * 400) return RELATIVE.format(Math.round(seconds / (86400 * 30)), "month");
  return RELATIVE.format(Math.round(seconds / (86400 * 365)), "year");
}
