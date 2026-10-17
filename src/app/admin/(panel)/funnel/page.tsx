import Link from "next/link";
import { funnelStages, getOrderMetrics } from "@/lib/admin/metrics";
import { FUNNEL_STEPS, parseRange, percent, siteFunnel } from "@/lib/admin/crm";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { FunnelBars, RangeTabs } from "@/components/admin/charts";
import { Card, EmptyState, Metric, PageHeader, Pill, linkClass, som } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Voronka" };

const LANES = [
  { key: "new", label: "Yangi", description: "Operator tasdigʻini kutmoqda" },
  { key: "confirmed", label: "Tasdiqlangan", description: "Yigʻish yoki joʻnatish kutilmoqda" },
  { key: "shipped", label: "Yoʻlda", description: "Yetkazib berilmoqda" },
  { key: "delivered", label: "Yetkazilgan", description: "Yakunlangan" },
  { key: "cancelled", label: "Bekor qilingan", description: "Yoʻqotilgan buyurtmalar" },
] as const;

const DROP_LINKS: Record<string, { href: string; label: string }> = {
  viewed: { href: "/admin/segments/browsers", label: "Koʻrib ketganlar" },
  carted: { href: "/admin/segments/abandoned-cart", label: "Savatni tashlab ketganlar" },
  checkout: { href: "/admin/segments/checkout-dropped", label: "Formada toʻxtaganlar" },
};

export default async function AdminFunnelPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = parseRange((await searchParams).range, 30);
  const [funnel, metrics] = await Promise.all([siteFunnel(range), getOrderMetrics(range)]);
  const f = funnel.current;
  const current = metrics.current;
  const stages = funnelStages(current.statusCounts);
  const lost = [
    { key: "viewed", label: "Kirdi, lekin mahsulot koʻrmadi", value: f.visitors - f.viewed },
    { key: "carted", label: "Koʻrdi, lekin savatga qoʻshmadi", value: f.viewed - f.carted },
    { key: "checkout", label: "Savatga qoʻshdi, lekin rasmiylashtirmadi", value: f.carted - f.checkout },
    { key: "purchased", label: "Formani ochdi, lekin yubormadi", value: f.checkout - f.purchased },
  ];
  const worst = lost.reduce((a, b) => (b.value > a.value ? b : a), lost[0]);

  return (
    <>
      <PageHeader title="Voronka" lead="Saytga kirgan odam qaysi bosqichda toʻxtayotgani va buyurtma qanday yakunlanayotgani." actions={<RangeTabs range={range} basePath="/admin/funnel" />} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Sayt voronkasi" lead="Noyob tashrif buyuruvchilar, tanlangan davrda">
          {f.visitors === 0 ? (
            <EmptyState title="Hali tashrif yozilmagan" />
          ) : (
            <FunnelBars steps={FUNNEL_STEPS.map((step) => ({ label: step.label, hint: step.hint, value: f[step.key] }))} />
          )}
        </Card>
        <Card title="Qayerda yoʻqotyapmiz" lead="Har bosqichda toʻxtab qolganlar">
          <ul className="flex flex-col gap-3">
            {lost.map((row) => (
              <li key={row.key} className={`rounded-[16px] p-4 ${row === worst && row.value > 0 ? "bg-ink text-white" : "bg-tile"}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold">{row.label}</span>
                  <span className="text-[18px] font-bold tabular-nums">{formatNumber(Math.max(0, row.value))}</span>
                </div>
                {DROP_LINKS[row.key] && (
                  <Link href={DROP_LINKS[row.key].href} className={`mt-1 inline-block text-[13px] font-semibold underline underline-offset-4 ${row === worst && row.value > 0 ? "text-on-dark-2" : "text-ink-2"}`}>
                    {DROP_LINKS[row.key].label} → retarget
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-bold leading-7 text-ink">Buyurtma bajarilishi</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stages.map((stage) => (
          <Metric key={stage.key} label={stage.label} value={formatNumber(stage.value)} hint={stage.rate !== null ? `oldingisidan ${stage.rate}%` : `${range} kunda`} />
        ))}
      </div>
      <p className="mt-2 text-[13px] text-muted">Yetkazilganlar summasi: <b className="text-ink">{som(current.deliveredRevenue)}</b> · bekor qilinganlar: {current.cancelledCount} ({percent(current.cancelledCount, current.orderCount)}%)</p>

      <section aria-label="Buyurtmalar holatlar boʻyicha" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {LANES.map((lane) => {
          const laneOrders = current.pipelineOrders.filter((order) => order.status === lane.key).slice(0, 6);
          const count = current.statusCounts[lane.key];
          return (
            <section key={lane.key} className="min-w-0 rounded-[20px] bg-tile p-3">
              <header className="mb-3 flex items-start justify-between gap-2 px-1 pt-1">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-ink">{lane.label}</h3>
                  <p className="text-[13px] text-muted">{lane.description}</p>
                </div>
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-white px-2 text-[13px] font-bold tabular-nums text-ink">{count}</span>
              </header>
              <div className="flex flex-col gap-2">
                {laneOrders.map((order) => (
                  <Link key={order.number ?? order.createdAt.toISOString()} href={`/admin/orders/${order.number}`} className="block rounded-[14px] bg-white p-3 transition-shadow hover:shadow-arrow">
                    <div className="flex items-center justify-between gap-2"><span className="text-[14px] font-bold text-ink">{order.number}</span><Pill tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Pill></div>
                    <p className="mt-1.5 truncate text-[14px] text-ink-2">{order.customer.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[13px] text-muted"><span className="truncate">{formatDateTime(order.createdAt)}</span><span className="shrink-0 font-semibold tabular-nums text-ink">{formatNumber(order.total)}</span></div>
                  </Link>
                ))}
                {count === 0 && <p className="rounded-[14px] bg-white/70 px-3 py-4 text-center text-[13px] text-muted">Buyurtma yoʻq</p>}
                {count > laneOrders.length && <Link href={`/admin/orders?status=${lane.key}`} className={`${linkClass} px-1 text-[13px]`}>+ yana {count - laneOrders.length} ta</Link>}
              </div>
            </section>
          );
        })}
      </section>
    </>
  );
}
