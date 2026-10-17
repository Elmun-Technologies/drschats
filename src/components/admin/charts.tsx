import Link from "next/link";
import { cn, formatNumber } from "@/lib/utils";
import { RANGES, type Range } from "@/lib/admin/crm";

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

export function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`;
}

/*
  One series per chart, one axis, ink bars on white — two measures get two
  charts, never a second y-scale. Each column is a hover target with the
  exact value; the same numbers sit in a visually hidden table.
*/
export function DailyBars({ title, data, format = formatNumber, unit, className }: { title: string; data: { date: string; value: number }[]; format?: (n: number) => string; unit?: string; className?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const every = Math.max(1, Math.ceil(data.length / 7));
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0] ?? { date: "", value: 0 });
  return (
    <section className={cn("min-w-0 rounded-[20px] border border-line bg-white p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[18px] font-bold leading-6 text-ink">{title}</h2>
        <p className="text-[14px] text-muted">Jami <span className="font-semibold tabular-nums text-ink">{format(total)}</span>{unit ? ` ${unit}` : ""}</p>
      </div>
      {total === 0 ? (
        <p className="grid h-[180px] place-items-center rounded-[16px] bg-tile text-[14px] text-muted">Bu davrda maʼlumot yoʻq</p>
      ) : (
        <div className="relative" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" />
          <span className="pointer-events-none absolute right-0 top-1 text-[12px] tabular-nums text-muted">{format(max)}</span>
          <div className="flex h-[180px] items-end gap-[2px] border-b border-line-strong pt-6">
            {data.map((d) => (
              <div key={d.date} title={`${dayLabel(d.date)}: ${format(d.value)}${unit ? ` ${unit}` : ""}`} className="group flex h-full min-w-0 flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-ink transition-opacity group-hover:opacity-70"
                  style={{ height: d.value > 0 ? `${Math.max(2, (d.value / max) * 100)}%` : "0%" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-[2px]">
            {data.map((d, i) => (
              <span key={d.date} className="min-w-0 flex-1 truncate text-center text-[12px] text-muted">
                {i % every === 0 || i === data.length - 1 ? dayLabel(d.date) : ""}
              </span>
            ))}
          </div>
          {peak.value > 0 && <p className="mt-2 text-[13px] text-muted">Eng yuqori: {dayLabel(peak.date)} — {format(peak.value)}{unit ? ` ${unit}` : ""}</p>}
        </div>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><th scope="row">{dayLabel(d.date)}</th><td>{format(d.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

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
