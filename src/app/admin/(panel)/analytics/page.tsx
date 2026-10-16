import Link from "next/link";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminRangeFilter } from "@/components/admin/AdminRangeFilter";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { funnelStages, getOrderMetrics, REPORT_RANGES, type ReportRange } from "@/lib/admin/metrics";
import { formatDateTime, STATUS_LABEL } from "@/lib/admin/order-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Analitika" };

function getRange(raw?: string): ReportRange {
  const number = Number(raw);
  return (REPORT_RANGES as readonly number[]).includes(number) ? number as ReportRange : 30;
}

function MetricIcon({ kind }: { kind: "cash" | "orders" | "ticket" | "delivery" }) {
  const paths = {
    cash: <><path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17V6.5A2.5 2.5 0 0 1 6 4h11" /><path d="M16 12h4M7 15h.01" /></>,
    orders: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    ticket: <><path d="M4 6h16v12H4z" /><path d="M8 10h8M8 14h4" /></>,
    delivery: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[18px] w-[18px]">{paths[kind]}</svg>;
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = getRange((await searchParams).range);
  const metrics = await getOrderMetrics(range);
  const current = metrics.current;
  const stages = funnelStages(current.statusCounts);
  const cancelledRate = current.orderCount ? Math.round((current.cancelledCount / current.orderCount) * 100) : 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Analitika" lead="Savdo natijalari buyurtmalar bazasidan hisoblanadi; tashriflar va sessiyalar provayder analitikasida koʻrinadi." />
        <AdminRangeFilter range={range} basePath="/admin/analytics" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetricCard label="Buyurtma summasi" value={`${formatNumber(current.revenue)} soʻm`} caption="Bekor qilingan buyurtmalar chiqarildi" delta={{ current: current.revenue, previous: metrics.previous.revenue }} icon={<MetricIcon kind="cash" />} />
        <AdminMetricCard label="Buyurtmalar" value={formatNumber(current.orderCount)} caption={`${current.deliveredCount} tasi yetkazilgan`} delta={{ current: current.orderCount, previous: metrics.previous.orderCount }} icon={<MetricIcon kind="orders" />} />
        <AdminMetricCard label="Oʻrtacha chek" value={`${formatNumber(current.averageOrder)} soʻm`} caption="Muvaffaqiyatli buyurtmalar boʻyicha" icon={<MetricIcon kind="ticket" />} />
        <AdminMetricCard label="Yetkazib berish ulushi" value={`${current.orderCount ? Math.round((current.deliveredCount / current.orderCount) * 100) : 0}%`} caption={`${current.deliveredCount} / ${current.orderCount} ta buyurtma`} icon={<MetricIcon kind="delivery" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <SalesTrendChart data={current.daily} label="Kunlik buyurtma summasi" />
        <Card title="Buyurtma bosqichlari" actions={<Link href="/admin/funnel" className="text-[11px] font-semibold text-[#0f2d24] hover:underline">Batafsil ↗</Link>}>
          <div className="space-y-4">
            {stages.map((stage) => (
              <div key={stage.key}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
                  <span className="font-medium text-[#44494e]">{stage.label}</span>
                  <span className="font-bold tabular-nums text-[#0f2d24]">{stage.value} <span className="font-normal text-[#63686e]">({stage.share}%)</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f1f3f0]"><div className="h-full rounded-full bg-[#0f2d24] transition-all" style={{ width: `${stage.share}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-sm bg-[#fdf0ef] px-3.5 py-3 text-[11px]"><span className="font-medium text-[#44494e]">Bekor qilingan</span><span className="font-bold text-[#c8161d]">{current.cancelledCount} ta · {cancelledRate}%</span></div>
          <p className="mt-3 text-[10px] leading-4 text-[#63686e]">Bu e-commerce fulfillment voronkasi, sayt tashrifchisi → xarid voronkasi emas.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Buyurtma manbasi va summa">
          {current.sources.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead><tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]"><th className="pb-3">Manba</th><th className="pb-3 text-right">Buyurtma</th><th className="pb-3 text-right">Summa</th><th className="pb-3 text-right">Ulush</th></tr></thead>
                <tbody className="divide-y divide-[#f1f3f0]">
                  {current.sources.map((source) => (
                    <tr key={source.name} className="text-[12px]"><td className="py-3 font-semibold text-[#44494e]">{source.name}</td><td className="py-3 text-right tabular-nums text-[#44494e]">{source.orders}</td><td className="py-3 text-right font-semibold tabular-nums text-[#0f2d24]">{formatNumber(source.revenue)} soʻm</td><td className="py-3 text-right tabular-nums text-[#63686e]">{current.orderCount ? Math.round((source.orders / current.orderCount) * 100) : 0}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-5 text-center text-[12px] text-[#63686e]">Manbalar bo‘yicha maʼlumot buyurtmalar kelgach ko‘rinadi.</p>}
          <p className="mt-3 text-[10px] leading-4 text-[#63686e]">UTM, click ID yoki tashqi referrer saqlangan buyurtmalar guruhlandi. Reklama xarajati ulanmaganligi sabab ROAS hisoblanmaydi.</p>
        </Card>

        <Card title="Mahsulotlar kesimida">
          {current.topProducts.length ? <ul className="divide-y divide-[#e4e6e8]">
            {current.topProducts.map((product, index) => (
              <li key={product.slug} className="flex items-center gap-3 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#f1f3f0] text-[10px] font-bold text-[#0f2d24]">{index + 1}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold text-[#44494e]">{product.name}</span><span className="text-[10px] text-[#63686e]">{product.quantity} dona</span></span>
                <span className="text-[12px] font-bold text-[#0f2d24]">{formatNumber(product.revenue)} soʻm</span>
              </li>
            ))}
          </ul> : <p className="py-5 text-center text-[12px] text-[#63686e]">Savdo maʼlumoti hozircha mavjud emas.</p>}
        </Card>
      </div>

      <Card title="Buyurtmalar orqali kelgan faollik" className="mt-4" actions={<span className="text-[10px] text-[#63686e]">Oxirgi {current.recentOrders.length} ta</span>}>
        {current.recentOrders.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead><tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]"><th className="pb-3">Buyurtma</th><th className="pb-3">Mijoz</th><th className="pb-3">Manba</th><th className="pb-3">Holat</th><th className="pb-3">Sana</th><th className="pb-3 text-right">Summa</th></tr></thead>
            <tbody className="divide-y divide-[#f1f3f0]">
              {current.recentOrders.map((order) => (
                <tr key={order.number ?? order.createdAt.toISOString()} className="text-[11px]">
                  <td className="py-3"><Link href={`/admin/orders/${order.number}`} className="font-bold text-[#0f2d24] hover:underline">{order.number}</Link></td>
                  <td className="max-w-[160px] truncate py-3 text-[#44494e]">{order.customer.name}</td>
                  <td className="max-w-[190px] truncate py-3 text-[#44494e]">{describeAttribution(order.attribution ?? undefined) || "Bevosita"}</td>
                  <td className="py-3 text-[#44494e]">{STATUS_LABEL[order.status]}</td>
                  <td className="whitespace-nowrap py-3 text-[#63686e]">{formatDateTime(order.createdAt)}</td>
                  <td className="whitespace-nowrap py-3 text-right font-semibold text-[#44494e]">{formatNumber(order.total)} soʻm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> : <p className="py-5 text-center text-[12px] text-[#63686e]">Tanlangan davrda buyurtma yoʻq.</p>}
      </Card>

      <div className="mt-4"><Notice>Sayt tashriflari, sessiyalar va savat tashlab ketish ko‘rsatkichlari hozircha ushbu bazada saqlanmaydi. GA4 yoki Yandex Metrika ulangan bo‘lsa, batafsil tashrif analitikasini provayder panelidan ko‘ring; ulash holati <Link href="/admin/integrations" className="font-semibold underline">Integratsiyalar</Link> bo‘limida.</Notice></div>
    </>
  );
}
