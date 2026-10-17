"use client";

import { useState, type KeyboardEvent } from "react";
import { cn, formatNumber } from "@/lib/utils";

/*
  The dashboard's main chart: one measure at a time (tabs switch it, never a
  second y-axis), this period as an ink line over a light area, the previous
  period of the same length as a dashed muted line on the same buckets.
  Hover or arrow keys move a crosshair with the exact values.
*/

export type TrendPoint = { key: string; label: string; visitors: number; orders: number; revenue: number };
type Measure = "revenue" | "orders" | "visitors";

const MEASURES: { key: Measure; label: string; unit: string }[] = [
  { key: "revenue", label: "Savdo", unit: "soʻm" },
  { key: "orders", label: "Buyurtmalar", unit: "ta" },
  { key: "visitors", label: "Tashriflar", unit: "kishi" },
];

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(".0", "")} mln`;
  if (value >= 10_000) return `${Math.round(value / 1000)} ming`;
  return formatNumber(Math.round(value));
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function pathOf(values: number[], max: number, close: boolean): string {
  const n = values.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 100;
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(3)},${y(v).toFixed(3)}`).join(" ");
  return close ? `${line} L100,100 L0,100 Z` : line;
}

export function TrendChart({ current, previous, unit, periodLabel }: { current: TrendPoint[]; previous: TrendPoint[]; unit: "hour" | "day"; periodLabel: string }) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const [active, setActive] = useState<number | null>(null);
  const meta = MEASURES.find((m) => m.key === measure)!;
  const values = current.map((p) => p[measure]);
  const prevValues = current.map((_, i) => previous[i]?.[measure] ?? 0);
  const max = niceMax(Math.max(...values, ...prevValues));
  const total = values.reduce((a, b) => a + b, 0);
  const prevTotal = previous.reduce((a, p) => a + p[measure], 0);
  const change = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;
  const n = current.length;
  const every = Math.max(1, Math.ceil(n / (unit === "hour" ? 8 : 7)));
  const xPct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const format = (v: number) => `${formatNumber(Math.round(v))} ${meta.unit}`;

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") setActive((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (event.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? n) - 1));
    else if (event.key === "Escape") setActive(null);
    else return;
    event.preventDefault();
  };

  return (
    <section className="flex h-full min-w-0 flex-col rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto rounded-[14px] bg-tile p-1" role="group" aria-label="Koʻrsatkich">
          {MEASURES.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={measure === m.key}
              onClick={() => setMeasure(m.key)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center rounded-[12px] px-3.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                measure === m.key ? "bg-white text-ink shadow-[0_1px_2px_rgba(23,25,27,0.08)]" : "text-ink-2 hover:text-ink",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="sm:text-right">
          <p className="text-[28px] font-bold leading-8 tabular-nums text-ink">{measure === "revenue" ? compact(total) : formatNumber(total)} <span className="text-[15px] font-semibold text-muted">{meta.unit}</span></p>
          <p className="mt-1 text-[13px] text-muted">
            {change !== null && <span className="mr-1.5 font-semibold tabular-nums text-ink">{change >= 0 ? "↑" : "↓"} {Math.abs(change)}%</span>}
            oldingi {periodLabel}: {measure === "revenue" ? compact(prevTotal) : formatNumber(prevTotal)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-ink-2" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 rounded-full bg-ink" />Shu davr</span>
        <span className="inline-flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-muted" />Oldingi davr</span>
      </div>

      <div className="mt-4 flex min-h-[268px] flex-1 gap-3">
        <div className="relative mb-7 w-12 shrink-0 text-right text-[12px] tabular-nums text-muted" aria-hidden="true">
          {[1, 0.5, 0].map((f) => (
            <span key={f} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - f) * 100}%` }}>{compact(max * f)}</span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="relative min-h-[240px] flex-1 rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            tabIndex={0}
            role="img"
            aria-label={`${meta.label}: jami ${format(total)}. Strelkalar bilan qiymatlarni koʻring.`}
            onKeyDown={onKey}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          >
            {[0, 0.5, 1].map((f) => (
              <div key={f} className={cn("pointer-events-none absolute inset-x-0 border-t", f === 1 ? "border-line-strong" : "border-dashed border-line")} style={{ top: `${f * 100}%` }} />
            ))}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <path d={pathOf(values, max, true)} className="fill-ink/[0.07]" />
              <path d={pathOf(prevValues, max, false)} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={1.5} strokeDasharray="5 4" className="stroke-muted" />
              <path d={pathOf(values, max, false)} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="stroke-ink" />
            </svg>
            <div className="absolute inset-0 flex">
              {current.map((p, i) => (
                <div key={p.key} className="h-full flex-1" onMouseEnter={() => setActive(i)} />
              ))}
            </div>
            {active !== null && (
              <>
                <div className="pointer-events-none absolute inset-y-0 w-px bg-ink/30" style={{ left: `${xPct(active)}%` }} />
                <div
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-white"
                  style={{ left: `${xPct(active)}%`, top: `${100 - (values[active] / max) * 100}%` }}
                />
                <div
                  role="status"
                  className={cn(
                    "pointer-events-none absolute top-2 z-10 min-w-[170px] rounded-[12px] border border-line bg-white px-3 py-2.5 text-[13px] shadow-[0_8px_24px_rgba(23,25,27,0.12)]",
                    xPct(active) > 60 ? "-translate-x-[calc(100%+12px)]" : "translate-x-3",
                  )}
                  style={{ left: `${xPct(active)}%` }}
                >
                  <p className="font-semibold text-ink">{current[active].label}</p>
                  <p className="mt-1 flex justify-between gap-4 text-ink"><span className="text-ink-2">Shu davr</span><b className="tabular-nums">{format(values[active])}</b></p>
                  <p className="mt-0.5 flex justify-between gap-4 text-ink"><span className="text-ink-2">{previous[active]?.label ?? "Oldingi"}</span><span className="tabular-nums">{format(prevValues[active])}</span></p>
                </div>
              </>
            )}
          </div>
          <div className="relative mt-2 h-5 text-[12px] text-muted" aria-hidden="true">
            {current.map((p, i) =>
              (i % every === 0 && n - 1 - i >= every / 2) || i === n - 1 ? (
                <span
                  key={p.key}
                  className={cn("absolute whitespace-nowrap", i === 0 ? "" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2", i !== 0 && i !== n - 1 && i !== Math.floor(n / 2 / every) * every && "max-sm:hidden")}
                  style={{ left: `${xPct(i)}%` }}
                >
                  {unit === "hour" ? p.key : p.label}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <div className="sr-only">
      <table>
        <caption>{meta.label}</caption>
        <thead><tr><th scope="col">Davr</th><th scope="col">Shu davr</th><th scope="col">Oldingi davr</th></tr></thead>
        <tbody>
          {current.map((p, i) => (
            <tr key={p.key}><th scope="row">{p.label}</th><td>{format(values[i])}</td><td>{format(prevValues[i])}</td></tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
