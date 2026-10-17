import Link from "next/link";
import { cn, formatNumber } from "@/lib/utils";
import { RANGES, type Range } from "@/lib/admin/crm";

const RANGE_LABEL: Record<Range, string> = { 1: "Bugun", 7: "7 kun", 30: "30 kun", 90: "90 kun" };

export function RangeTabs({ range, basePath, extra = "" }: { range: Range; basePath: string; extra?: string }) {
  return (
    <nav aria-label="Hisobot davri" className="flex gap-1 rounded-[14px] bg-tile p-1">
      {RANGES.map((value) => (
        <Link
          key={value}
          href={`${basePath}?range=${value}${extra}`}
          aria-current={range === value ? "page" : undefined}
          className={cn(
            "inline-flex h-11 items-center rounded-[12px] px-3.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
            range === value ? "bg-ink text-white" : "text-ink-2 hover:bg-white hover:text-ink",
          )}
        >
          {RANGE_LABEL[value]}
        </Link>
      ))}
    </nav>
  );
}

/** The site funnel as stepped bars, each with its share of entries and the drop from the step before. */
export function FunnelBars({ steps }: { steps: { label: string; hint?: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 0);
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : null;
        const rate = prev ? Math.round((step.value / prev) * 1000) / 10 : null;
        const share = Math.round((step.value / top) * 1000) / 10;
        return (
          <li key={step.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-[15px] font-semibold text-ink">
                <span className="mr-2 tabular-nums text-muted">{index + 1}</span>
                {step.label}
              </span>
              <span className="text-[15px] font-bold tabular-nums text-ink">{formatNumber(step.value)}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-tile">
              <div className="h-full rounded-full bg-ink" style={{ width: `${step.value ? Math.max(1, share) : 0}%` }} />
            </div>
            <p className="mt-1.5 text-[13px] text-muted">
              {index === 0 ? step.hint : `${share}% kirganlardan${rate !== null ? ` · oldingi bosqichdan ${rate}% oʻtdi` : ""}`}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** A trend glyph for a KPI tile: one ink line, no axis — the tile's number is the value. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2 || values.every((v) => v === 0)) return <span className={cn("block h-8", className)} aria-hidden="true" />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(2)},${(28 - ((v - min) / span) * 24).toFixed(2)}`);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true" className={cn("block h-8 w-full overflow-visible", className)}>
      <polygon points={`0,32 ${points.join(" ")} 100,32`} className="fill-ink/[0.06]" />
      <polyline points={points.join(" ")} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" className="stroke-ink" />
    </svg>
  );
}

const SHARE_TONES = ["bg-ink", "bg-muted", "bg-line-strong", "bg-chip-strong"];

/**
 * Parts of one whole as a single segmented bar with a legend that carries the
 * numbers — identity is never colour alone. Up to four parts, darkest first.
 */
export function ShareBar({ parts, format = formatNumber }: { parts: { label: string; value: number; note?: string }[]; format?: (n: number) => string }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  if (total === 0) return <p className="rounded-[12px] bg-tile px-4 py-5 text-center text-[14px] text-muted">Maʼlumot yoʻq</p>;
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
        {parts.map((p, i) => p.value > 0 && <div key={p.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", SHARE_TONES[i])} style={{ width: `${(p.value / total) * 100}%` }} />)}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-3 text-[14px]">
            <span className={cn("h-3 w-3 shrink-0 rounded-[3px]", SHARE_TONES[i])} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-ink">{p.label}{p.note && <span className="ml-1.5 text-[13px] text-muted">{p.note}</span>}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{format(p.value)}</span>
            <span className="w-12 shrink-0 text-right tabular-nums text-muted">{Math.round((p.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
