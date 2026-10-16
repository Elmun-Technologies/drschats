import type { ReactNode } from "react";

type Delta = { current: number; previous: number; format?: (value: number) => string };

export function AdminMetricCard({
  label,
  value,
  caption,
  icon,
  delta,
}: {
  label: string;
  value: string;
  caption?: ReactNode;
  icon: ReactNode;
  delta?: Delta;
}) {
  const change = delta && delta.previous > 0 ? Math.round(((delta.current - delta.previous) / delta.previous) * 100) : null;
  const isUp = (change ?? 0) >= 0;
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium leading-4 text-muted">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-tile text-forest">{icon}</span>
      </div>
      <p className="mt-3 text-[24px] font-semibold leading-8 tracking-[-0.04em] text-ink sm:text-[27px]">{value}</p>
      <div className="mt-2 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
        {change !== null ? (
          <span className={`inline-flex items-center gap-1 font-semibold ${isUp ? "text-forest" : "text-red"}`}>
            <span aria-hidden="true">{isUp ? "↗" : "↘"}</span>{Math.abs(change)}%
          </span>
        ) : null}
        <span className="text-muted">{caption ?? (delta?.previous === 0 ? "Oldingi davrda buyurtma yoʻq" : "Tanlangan davr")}</span>
      </div>
    </section>
  );
}
