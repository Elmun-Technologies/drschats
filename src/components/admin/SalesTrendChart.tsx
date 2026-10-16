import { formatNumber } from "@/lib/utils";
import type { DailyMetric } from "@/lib/admin/metrics";

export function SalesTrendChart({ data, label = "Buyurtma summasi" }: { data: DailyMetric[]; label?: string }) {
  const width = 720;
  const height = 224;
  const left = 14;
  const right = 14;
  const top = 16;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(1, ...data.map((point) => point.revenue));
  const points = data.map((point, index) => {
    const x = left + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const y = top + plotHeight - (point.revenue / maxValue) * plotHeight;
    return { x, y, point };
  });
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = points.length ? `${line} L${points[points.length - 1].x},${top + plotHeight} L${points[0].x},${top + plotHeight} Z` : "";
  const tickEvery = Math.max(1, Math.ceil(data.length / 6));
  const hasSales = data.some((point) => point.revenue > 0);
  const last = [...data].reverse().find((point) => point.revenue > 0);

  return (
    <section aria-labelledby="sales-chart-title" className="rounded-md border border-line bg-white p-5 shadow-[0_2px_10px_rgba(23,25,27,0.03)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sales-chart-title" className="text-[15px] font-semibold text-ink">{label}</h2>
          <p className="mt-1 text-[11px] text-muted">Bekor qilingan buyurtmalar summaga kiritilmagan</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Davr boʻyicha jami</p>
          <p className="mt-1 text-[17px] font-semibold tabular-nums text-forest">{formatNumber(data.reduce((sum, point) => sum + point.revenue, 0))} <span className="text-[11px] font-medium">soʻm</span></p>
        </div>
      </div>
      {hasSales ? (
        <>
          <div className="relative">
            <div className="absolute left-0 top-0 flex h-[190px] flex-col justify-between pb-[34px] text-[9px] tabular-nums text-muted" aria-hidden="true">
              <span>{formatNumber(maxValue)}</span><span>{formatNumber(Math.round(maxValue / 2))}</span><span>0</span>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${last ? `soʻnggi faollik ${last.label} kuni` : "maʼlumot yoʻq"}`} className="h-[190px] w-full overflow-visible pl-9">
              <defs>
                <linearGradient id="admin-sales-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f2d24" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0f2d24" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map((ratio) => {
                const y = top + plotHeight * ratio;
                return <line key={ratio} x1={left} x2={width - right} y1={y} y2={y} stroke="#e4e6e8" strokeDasharray={ratio === 1 ? "0" : "4 5"} />;
              })}
              {area && <path d={area} fill="url(#admin-sales-fill)" />}
              {line && <path d={line} fill="none" stroke="#0f2d24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
              {points.map(({ x, y, point }, index) => (point.revenue > 0 && (data.length <= 10 || index % tickEvery === 0 || index === points.length - 1) ? <circle key={point.date} cx={x} cy={y} r="3.2" fill="#fff" stroke="#0f2d24" strokeWidth="2" /> : null))}
              {points.map(({ x, point }, index) => (index % tickEvery === 0 || index === points.length - 1 ? <text key={`label-${point.date}`} x={x} y={height - 8} textAnchor="middle" fill="#63686e" fontSize="10">{point.label}</text> : null))}
            </svg>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted"><span className="h-2 w-2 rounded-full bg-forest" /> Kunlik buyurtma summasi</div>
        </>
      ) : (
        <div className="grid min-h-[190px] place-items-center rounded-sm bg-tile px-4 text-center">
          <div><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-forest">↗</span><p className="mt-3 text-[13px] font-semibold text-ink">Bu davrda buyurtma summasi yoʻq</p><p className="mt-1 text-[11px] text-muted">Buyurtmalar kelishi bilan grafik shu yerda yangilanadi.</p></div>
        </div>
      )}
    </section>
  );
}
