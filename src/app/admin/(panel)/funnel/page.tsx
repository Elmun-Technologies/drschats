import Link from "next/link";
import { AdminRangeFilter } from "@/components/admin/AdminRangeFilter";
import { Card, PageHeader, Pill, secondaryButtonClass } from "@/components/admin/ui";
import { funnelStages, getOrderMetrics, REPORT_RANGES, type ReportRange } from "@/lib/admin/metrics";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Savdo voronkasi" };

function getRange(raw?: string): ReportRange {
  const number = Number(raw);
  return (REPORT_RANGES as readonly number[]).includes(number) ? number as ReportRange : 30;
}

const lanes = [
  { key: "new", label: "Yangi", tone: "new", description: "Operator tasdigʻini kutmoqda" },
  { key: "confirmed", label: "Tasdiqlangan", tone: "confirmed", description: "Yigʻish yoki joʻnatish kutilmoqda" },
  { key: "shipped", label: "Yoʻlda", tone: "shipped", description: "Yetkazib berish jarayonida" },
  { key: "delivered", label: "Yetkazilgan", tone: "delivered", description: "Muvaffaqiyatli yakunlangan" },
  { key: "cancelled", label: "Bekor qilingan", tone: "cancelled", description: "Yoʻqotilgan buyurtmalar" },
] as const;

function laneColor(tone: string) {
  if (tone === "new") return "bg-[#0f2d24]";
  if (tone === "confirmed") return "bg-[#0f2d24]";
  if (tone === "shipped") return "bg-[#806a3e]";
  if (tone === "delivered") return "bg-[#0f2d24]";
  return "bg-[#c8161d]";
}

export default async function AdminFunnelPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = getRange((await searchParams).range);
  const metrics = await getOrderMetrics(range);
  const current = metrics.current;
  const stages = funnelStages(current.statusCounts);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Savdo voronkasi" lead="Buyurtma yaratilganidan yetkazilgunigacha boʻlgan operatsion jarayon." />
        <div className="flex items-center gap-2"><AdminRangeFilter range={range} basePath="/admin/funnel" /><Link href="/admin/orders" className={secondaryButtonClass}>Buyurtmalar</Link></div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-md border border-[#e4e6e8] bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.035)]"><p className="text-[11px] text-[#63686e]">Yangi buyurtmalar</p><p className="mt-2 text-[24px] font-bold text-[#0f2d24]">{current.orderCount}</p><p className="mt-1 text-[10px] text-[#63686e]">{range} kun ichida yaratilgan</p></div>
        <div className="rounded-md border border-[#e4e6e8] bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.035)]"><p className="text-[11px] text-[#63686e]">Faol ishlovda</p><p className="mt-2 text-[24px] font-bold text-[#0f2d24]">{current.statusCounts.new + current.statusCounts.confirmed + current.statusCounts.shipped}</p><p className="mt-1 text-[10px] text-[#63686e]">Yangi, tasdiqlangan yoki yoʻlda</p></div>
        <div className="rounded-md border border-[#e4e6e8] bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.035)]"><p className="text-[11px] text-[#63686e]">Yetkazilgan</p><p className="mt-2 text-[24px] font-bold text-[#0f2d24]">{current.deliveredCount}</p><p className="mt-1 text-[10px] text-[#63686e]">{current.orderCount ? Math.round((current.deliveredCount / current.orderCount) * 100) : 0}% buyurtma ulushi</p></div>
        <div className="rounded-md border border-[#e4e6e8] bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.035)]"><p className="text-[11px] text-[#63686e]">Yetkazilgan buyurtmalar summasi</p><p className="mt-2 text-[24px] font-bold text-[#0f2d24]">{formatNumber(current.deliveredRevenue)}</p><p className="mt-1 text-[10px] text-[#63686e]">soʻm, tanlangan davrda</p></div>
      </div>

      <Card title="Bosqichlar boʻyicha konversiya" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          {stages.map((stage, index) => (
            <div key={stage.key} className="relative rounded-sm bg-[#f1f3f0] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#63686e]">{String(index + 1).padStart(2, "0")} · {stage.label}</p>
              <p className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-[#0f2d24]">{stage.value}</p>
              <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4e6e8]"><div className="h-full rounded-full bg-[#0f2d24]" style={{ width: `${stage.share}%` }} /></div><span className="text-[10px] font-semibold text-[#44494e]">{stage.share}%</span></div>
              {stage.rate !== null && <p className="mt-2 text-[10px] text-[#63686e]">Oldingi bosqichdan {stage.rate}% oʻtdi</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-4 text-[#63686e]">Hisob joriy statuslardan tuziladi: masalan, “Yoʻlda” va “Yetkazilgan” buyurtmalar tasdiqlangan bosqichidan oʻtgan deb sanaladi. Bekor qilinganlar konversiyaga kiritilmaydi.</p>
      </Card>

      <section aria-label="Buyurtmalar bosqichlar kesimida" className="grid gap-3 xl:grid-cols-5">
        {lanes.map((lane) => {
          const laneOrders = current.pipelineOrders.filter((order) => order.status === lane.key).slice(0, 6);
          const count = current.statusCounts[lane.key];
          return (
            <section key={lane.key} className="min-w-0 rounded-md border border-[#e4e6e8] bg-[#f1f3f0] p-3">
              <header className="mb-3 flex items-start justify-between gap-2 px-1 py-1">
                <div className="min-w-0"><h2 className="flex items-center gap-2 text-[12px] font-bold text-[#0f2d24]"><span className={`h-2 w-2 rounded-full ${laneColor(lane.tone)}`} />{lane.label}</h2><p className="mt-1 text-[9px] leading-3 text-[#63686e]">{lane.description}</p></div>
                <span className="grid h-6 min-w-6 place-items-center rounded-md bg-white px-1.5 text-[10px] font-bold text-[#44494e]">{count}</span>
              </header>
              <div className="space-y-2">
                {laneOrders.map((order) => (
                  <Link key={order.number ?? order.createdAt.toISOString()} href={`/admin/orders/${order.number}`} className="block rounded-sm border border-[#e4e6e8] bg-white p-3 transition hover:border-[#e4e6e8] hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-bold text-[#0f2d24]">{order.number}</span><Pill tone={order.status === "new" ? "dark" : order.status === "cancelled" ? "red" : "neutral"}>{STATUS_LABEL[order.status]}</Pill></div>
                    <p className="mt-2 truncate text-[11px] font-semibold text-[#44494e]">{order.customer.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-[#63686e]"><span className="truncate">{formatDateTime(order.createdAt)}</span><span className="shrink-0 font-bold text-[#44494e]">{formatNumber(order.total)}</span></div>
                  </Link>
                ))}
                {count === 0 && <div className="rounded-sm border border-dashed border-[#e4e6e8] bg-white/60 px-3 py-5 text-center text-[10px] text-[#63686e]">Hozircha buyurtma yoʻq</div>}
                {count > laneOrders.length && <p className="px-1 pt-1 text-[10px] text-[#63686e]">+ yana {count - laneOrders.length} ta</p>}
              </div>
            </section>
          );
        })}
      </section>

      <div className="mt-4 rounded-sm border border-[#e4e6e8] bg-[#f1f3f0] p-4 text-[11px] leading-5 text-[#63686e]">
        <span className="font-bold text-[#0f2d24]">Bosqichlar avtomatik yangilanishi:</span> yangi buyurtma tizimga avtomatik tushadi. Tasdiqlash va yetkazildi statuslari hozir operator tomonidan belgilanadi; BTS/Yandex kuryer API ulanmaguncha logistika bosqichlari avtomatik sinxronlanmaydi. Status oʻzgarganda mijozga Telegram xabari sozlangan boʻlsa yuboriladi.
      </div>
    </>
  );
}
