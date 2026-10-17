import Link from "next/link";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/session";
import { getDb } from "@/lib/db/client";
import { catalogCounts } from "@/lib/admin/queries";
import { getOrderMetrics } from "@/lib/admin/metrics";
import { FUNNEL_STEPS, channels, dailyTraffic, liveNow, parseRange, percent, siteFunnel } from "@/lib/admin/crm";
import { segmentCounts } from "@/lib/admin/segments";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { DailyBars, FunnelBars, RangeTabs } from "@/components/admin/charts";
import { BarList, Card, EmptyState, Metric, PageHeader, Pill, TableWrap, buttonClass, linkClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Bosh sahifa" };

async function openTickets(): Promise<number> {
  const rows = (await getDb().execute(sql`select count(*) as n from bot_tickets where status = 'open'`)) as unknown as { n: string }[];
  return Number(rows[0]?.n ?? 0);
}

function Attention({ href, value, label, hint }: { href: string; value: number; label: string; hint: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-4 rounded-[20px] border border-line bg-white p-4 transition-colors hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
      <span className={`grid h-12 min-w-12 shrink-0 place-items-center rounded-[14px] px-2 text-[18px] font-bold tabular-nums ${value > 0 ? "bg-ink text-white" : "bg-tile text-muted"}`}>{formatNumber(value)}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        <span className="block text-[13px] leading-[17px] text-muted">{hint}</span>
      </span>
    </Link>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = parseRange((await searchParams).range, 7);
  const admin = await requireAdmin();
  const [metrics, funnel, daily, channelRows, live, segments, counts, tickets] = await Promise.all([
    getOrderMetrics(range),
    siteFunnel(range),
    dailyTraffic(range),
    channels(range),
    liveNow(),
    segmentCounts(),
    catalogCounts(),
    openTickets(),
  ]);
  const current = metrics.current;
  const previous = metrics.previous;
  const conversion = percent(funnel.current.purchased, funnel.current.visitors);
  const previousConversion = percent(funnel.previous.purchased, funnel.previous.visitors);

  return (
    <>
      <PageHeader
        eyebrow={`Xush kelibsiz, ${admin.name.split(" ")[0]}`}
        title="Bosh sahifa"
        lead={<><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-ink align-middle" aria-hidden="true" />Hozir saytda <b className="tabular-nums">{formatNumber(live)}</b> kishi (oxirgi 5 daqiqa)</>}
        actions={<><RangeTabs range={range} basePath="/admin" /><Link href="/admin/products/new" className={buttonClass}>+ Mahsulot</Link></>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Tashrif buyuruvchilar" value={formatNumber(funnel.current.visitors)} hint={`${formatNumber(funnel.newVisitors)} ta yangi`} delta={{ current: funnel.current.visitors, previous: funnel.previous.visitors }} href={`/admin/analytics?range=${range}`} />
        <Metric label="Konversiya" value={`${conversion}%`} hint="kirgandan xaridgacha" delta={previousConversion ? { current: conversion, previous: previousConversion } : undefined} href={`/admin/funnel?range=${range}`} />
        <Metric label="Buyurtmalar" value={formatNumber(current.orderCount)} hint={`${current.cancelledCount} ta bekor`} delta={{ current: current.orderCount, previous: previous.orderCount }} href="/admin/orders" />
        <Metric label="Savdo summasi" value={som(current.revenue)} hint="bekor qilinganlarsiz" delta={{ current: current.revenue, previous: previous.revenue }} />
        <Metric label="Oʻrtacha chek" value={som(current.averageOrder)} hint={`${formatNumber(current.customerCount)} ta mijoz`} delta={previous.averageOrder ? { current: current.averageOrder, previous: previous.averageOrder } : undefined} />
      </div>

      <h2 className="mb-3 mt-8 text-[22px] font-bold leading-7 text-ink">Eʼtibor talab qiladi</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Attention href="/admin/orders?status=new" value={current.statusCounts.new} label="Yangi buyurtmalar" hint="Operator tasdigʻini kutmoqda" />
        <Attention href="/admin/visitors?filter=abandoned" value={segments["abandoned-cart"]?.size ?? 0} label="Tashlab ketilgan savatlar" hint={`${som(segments["abandoned-cart"]?.value ?? 0)} savatlarda qoldi`} />
        <Attention href="/admin/segments/course-ending" value={segments["course-ending"]?.size ?? 0} label="Kursi tugayotganlar" hint="Takroriy xarid vaqti keldi" />
        <Attention href="/admin/bot/tickets" value={tickets} label="Ochiq murojaatlar" hint="Telegram klubdagi savollar" />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <DailyBars title="Tashrif buyuruvchilar" data={daily.map((d) => ({ date: d.date, value: d.visitors }))} unit="kishi" />
        <DailyBars title="Savdo summasi" data={daily.map((d) => ({ date: d.date, value: d.revenue }))} unit="soʻm" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card title="Sayt voronkasi" lead="Kirgan odam qaysi bosqichda toʻxtayapti" actions={<Link href={`/admin/funnel?range=${range}`} className={linkClass}>Batafsil</Link>}>
          {funnel.current.visitors === 0 ? (
            <EmptyState title="Hali tashrif yozilmagan">Kuzatuv yangi build bilan yoqiladi — birinchi tashriflardan keyin voronka shu yerda koʻrinadi.</EmptyState>
          ) : (
            <FunnelBars steps={FUNNEL_STEPS.map((step) => ({ label: step.label, hint: step.hint, value: funnel.current[step.key] }))} />
          )}
        </Card>
        <Card title="Qayerdan kelishyapti" lead="Birinchi tashrif manbasi" actions={<Link href={`/admin/analytics?range=${range}`} className={linkClass}>Analitika</Link>}>
          <BarList rows={channelRows.slice(0, 7).map((c) => ({ label: c.channel, value: c.visitors, note: c.buyers ? `${c.buyers} ta xaridor · ${som(c.revenue)}` : undefined }))} empty="Tashriflar yozilgach manbalar shu yerda chiqadi" />
        </Card>
      </div>

      <Card title="Soʻnggi buyurtmalar" className="mt-4" actions={<Link href="/admin/orders" className={linkClass}>Hammasi</Link>}>
        {current.recentOrders.length === 0 ? (
          <EmptyState title="Bu davrda buyurtma yoʻq" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Buyurtma</th><th className={thClass}>Mijoz</th><th className={thClass}>Vaqt</th><th className={thClass}>Holat</th><th className={`${thClass} text-right`}>Jami</th></tr></thead>
              <tbody>
                {current.recentOrders.slice(0, 8).map((order) => (
                  <tr key={order.number ?? order.createdAt.toISOString()}>
                    <td className={tdClass}><Link href={`/admin/orders/${order.number}`} className={linkClass}>{order.number}</Link></td>
                    <td className={`${tdClass} max-w-[220px] truncate`}>{order.customer.name}</td>
                    <td className={`${tdClass} whitespace-nowrap text-ink-2`}>{formatDateTime(order.createdAt)}</td>
                    <td className={tdClass}><Pill tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Pill></td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Eng koʻp sotilganlar">
          <BarList rows={current.topProducts.map((p) => ({ label: p.name, value: p.revenue, note: `${p.quantity} dona` }))} format={som} empty="Buyurtmalar tushgach chiqadi" />
        </Card>
        <Card title="Katalog" actions={<Link href="/admin/products" className={linkClass}>Mahsulotlar</Link>}>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Mahsulotlar" value={formatNumber(counts.products)} href="/admin/products" />
            <Metric label="Tugagan" value={formatNumber(counts.outOfStock)} href="/admin/products?filter=out" />
            <Metric label="Kategoriyalar" value={formatNumber(counts.categories)} href="/admin/categories" />
            <Metric label="Sotuvdan olingan" value={formatNumber(counts.hidden)} href="/admin/products?filter=hidden" />
          </div>
        </Card>
      </div>
    </>
  );
}
