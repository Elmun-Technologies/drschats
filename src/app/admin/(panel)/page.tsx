import Image from "next/image";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db/client";
import { catalogCounts, lowStockCount } from "@/lib/admin/queries";
import { waitingCount } from "@/lib/admin/waitlist";
import { getOrderMetrics } from "@/lib/admin/metrics";
import { FUNNEL_STEPS, channels, devices, liveNow, parseRange, percent, siteFunnel, type Range } from "@/lib/admin/crm";
import { activityHeatmap, categorySales, customerMix, topProducts, trafficSeries } from "@/lib/admin/dashboard";
import { segmentCounts } from "@/lib/admin/segments";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { ORDER_STATUSES } from "@/lib/db/schema";
import { FunnelBars, RangeTabs, ShareBar, Sparkline } from "@/components/admin/charts";
import { TrendChart } from "@/components/admin/TrendChart";
import { ActivityHeatmap } from "@/components/admin/ActivityHeatmap";
import { BarList, Card, EmptyState, Metric, PageHeader, Pill, TableWrap, buttonClass, linkClass, secondaryButtonClass, som, somShort, tableClass, tdClass, thClass, timeAgo } from "@/components/admin/ui";
import { cn, formatNumber } from "@/lib/utils";
import { adminTitle, labels, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Bosh sahifa");

const PERIOD: Record<Range, string> = labels({ 1: "kun", 7: "7 kun", 30: "30 kun", 90: "90 kun" });

async function openTickets(): Promise<number> {
  const rows = (await getDb().execute(sql`select count(*) as n from bot_tickets where status = 'open'`)) as unknown as { n: string }[];
  return Number(rows[0]?.n ?? 0);
}

function Attention({ href, value, label, hint }: { href: string; value: number; label: string; hint: string }) {
  return (
    <li>
      <Link href={href} className="-mx-2 flex min-h-14 items-center gap-3 rounded-[12px] px-2 py-2 transition-colors hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
        <span className={`grid h-10 min-w-10 shrink-0 place-items-center rounded-[12px] px-2 text-[15px] font-bold tabular-nums ${value > 0 ? "bg-ink text-white" : "bg-tile text-muted"}`}>{formatNumber(value)}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-5 text-ink">{label}</span>
          <span className="block truncate text-[13px] leading-[17px] text-muted">{hint}</span>
        </span>
        <span aria-hidden="true" className="text-muted">›</span>
      </Link>
    </li>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string | string[]; denied?: string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  // Revenue and traffic are the analytics permission; an operator starts at the orders.
  if (!can(admin.role, "analytics")) redirect(params.denied === "1" ? "/admin/orders?denied=1" : "/admin/orders");
  const range = parseRange(params.range, 7);
  const [metrics, funnel, series, channelRows, deviceRows, mix, heat, cats, top, live, segments, counts, tickets, lowStock, waiting] = await Promise.all([
    getOrderMetrics(range),
    siteFunnel(range),
    trafficSeries(range),
    channels(range),
    devices(range),
    customerMix(range),
    activityHeatmap(range),
    categorySales(range),
    topProducts(range, 6),
    liveNow(),
    segmentCounts(),
    catalogCounts(),
    openTickets(),
    lowStockCount(),
    waitingCount(),
  ]);
  const current = metrics.current;
  const previous = metrics.previous;
  const conversion = percent(funnel.current.purchased, funnel.current.visitors);
  const previousConversion = percent(funnel.previous.purchased, funnel.previous.visitors);
  const points = series.current;
  const spark = (pick: (p: (typeof points)[number]) => number) => <Sparkline values={points.map(pick)} />;
  const open = current.statusCounts.new + current.statusCounts.confirmed + current.statusCounts.shipped;

  return (
    <>
      <PageHeader
        eyebrow={t("Xush kelibsiz, {name}", { name: admin.name.split(" ")[0] })}
        title={t("Bosh sahifa")}
        lead={<><span className="relative mr-2 inline-flex h-2.5 w-2.5 align-middle" aria-hidden="true">{live > 0 && <span className="absolute inset-0 animate-ping rounded-full bg-ink/40" />}<span className="relative h-2.5 w-2.5 rounded-full bg-ink" /></span>{t("Hozir saytda")} <b className="tabular-nums">{formatNumber(live)}</b> {t("kishi · oxirgi 5 daqiqa")}</>}
        actions={<><RangeTabs range={range} basePath="/admin" /><Link href="/admin/products/new" className={buttonClass}>{t("+ Mahsulot")}</Link></>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <Metric label={t("Savdo summasi")} value={somShort(current.revenue)} hint={t("bekor qilinganlarsiz")} delta={{ current: current.revenue, previous: previous.revenue }} chart={spark((p) => p.revenue)} />
        <Metric label={t("Buyurtmalar")} value={formatNumber(current.orderCount)} hint={current.cancelledCount ? t("{n} ta bekor", { n: current.cancelledCount }) : t("bekor yoʻq")} delta={{ current: current.orderCount, previous: previous.orderCount }} href="/admin/orders" chart={spark((p) => p.orders)} />
        <Metric label={t("Oʻrtacha chek")} value={som(current.averageOrder)} hint={t("{n} ta mijoz", { n: formatNumber(current.customerCount) })} delta={previous.averageOrder ? { current: current.averageOrder, previous: previous.averageOrder } : undefined} chart={spark((p) => (p.orders ? p.revenue / p.orders : 0))} />
        <Metric label={t("Tashrif buyuruvchilar")} value={formatNumber(funnel.current.visitors)} hint={t("{n} ta yangi", { n: formatNumber(funnel.newVisitors) })} delta={{ current: funnel.current.visitors, previous: funnel.previous.visitors }} href={`/admin/analytics?range=${range}`} chart={spark((p) => p.visitors)} />
        <div className="col-span-2 lg:col-span-1">
          <Metric label={t("Konversiya")} value={`${conversion}%`} hint={t("{n} ta xaridor", { n: formatNumber(funnel.current.purchased) })} delta={previousConversion ? { current: conversion, previous: previousConversion } : undefined} href={`/admin/funnel?range=${range}`} chart={spark((p) => (p.visitors ? p.orders / p.visitors : 0))} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <TrendChart current={series.current} previous={series.previous} unit={series.unit} periodLabel={PERIOD[range]} />
        <div className="flex min-w-0 flex-col gap-4">
          <Card title={t("Buyurtmalar oqimi")} lead={t("{n} ta buyurtma ishlov kutmoqda", { n: formatNumber(open) })} actions={<Link href="/admin/orders" className={linkClass}>{t("Hammasi")}</Link>}>
            <ul className="flex flex-col">
              {ORDER_STATUSES.map((status) => {
                const value = current.statusCounts[status];
                const share = current.orderCount ? (value / current.orderCount) * 100 : 0;
                return (
                  <li key={status}>
                    <Link href={`/admin/orders?status=${status}`} className="-mx-2 grid min-h-11 grid-cols-[110px_1fr_auto] items-center gap-3 rounded-[10px] px-2 hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
                      <span className="text-[14px] text-ink-2">{STATUS_LABEL[status]}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-tile"><span className={cn("block h-full rounded-full", status === "cancelled" ? "bg-line-strong" : "bg-ink")} style={{ width: `${value ? Math.max(3, share) : 0}%` }} /></span>
                      <span className="min-w-8 text-right text-[15px] font-bold tabular-nums text-ink">{formatNumber(value)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title={t("Eʼtibor talab qiladi")} className="flex-1">
            <ul className="flex flex-col">
              <Attention href="/admin/orders?status=new" value={current.statusCounts.new} label={t("Yangi buyurtmalar")} hint={t("Operator tasdigʻini kutmoqda")} />
              <Attention href="/admin/visitors?filter=abandoned" value={segments["abandoned-cart"]?.size ?? 0} label={t("Tashlab ketilgan savatlar")} hint={t("{sum} savatlarda qoldi", { sum: som(segments["abandoned-cart"]?.value ?? 0) })} />
              <Attention href="/admin/segments/course-ending" value={segments["course-ending"]?.size ?? 0} label={t("Kursi tugayotganlar")} hint={t("Takroriy xarid vaqti keldi")} />
              <Attention href="/admin/products?filter=out" value={counts.outOfStock} label={t("Tugagan mahsulotlar")} hint={t("Saytda «tugagan» koʻrinmoqda")} />
              <Attention href="/admin/products?filter=low" value={lowStock} label={t("Kam qolganlar")} hint={t("Omborda chegaradan kam — buyurtma bering")} />
              <Attention href="/admin/waitlist" value={waiting} label={t("Kelishini kutayotganlar")} hint={t("«Omborga keldi» yoki «narx tushdi» xabarini kutmoqda")} />
              <Attention href="/admin/bot/tickets" value={tickets} label={t("Ochiq murojaatlar")} hint={t("Telegram klubdagi savollar")} />
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card title={t("Sayt voronkasi")} lead={t("Kirgan odam qaysi bosqichda toʻxtayapti")} actions={<Link href={`/admin/funnel?range=${range}`} className={linkClass}>{t("Batafsil")}</Link>}>
          {funnel.current.visitors === 0 ? (
            <EmptyState title={t("Hali tashrif yozilmagan")}>{t("Birinchi tashriflardan keyin voronka shu yerda koʻrinadi.")}</EmptyState>
          ) : (
            <FunnelBars steps={FUNNEL_STEPS.map((step) => ({ label: step.label, hint: step.hint, value: funnel.current[step.key] }))} />
          )}
        </Card>
        <Card title={t("Qayerdan kelishyapti")} lead={t("Birinchi tashrif manbasi")} actions={<Link href={`/admin/analytics?range=${range}`} className={linkClass}>{t("Analitika")}</Link>}>
          <BarList rows={channelRows.slice(0, 7).map((c) => ({ label: c.channel, value: c.visitors, note: c.buyers ? `${t("{n} ta xaridor", { n: c.buyers })} · ${som(c.revenue)} · ${percent(c.buyers, c.visitors)}%` : undefined }))} empty={t("Tashriflar yozilgach manbalar shu yerda chiqadi")} />
        </Card>
        <Card title={t("Mijozlar")} lead={t("Buyurtmalar: birinchi xarid va qaytib kelganlar")} className="lg:col-span-2 xl:col-span-1">
          <ShareBar
            parts={[
              { label: t("Qaytgan mijozlar"), value: mix.returningOrders, note: somShort(mix.returningRevenue) },
              { label: t("Yangi mijozlar"), value: mix.newOrders, note: somShort(mix.newRevenue) },
            ]}
          />
          <h3 className="mb-3 mt-6 border-t border-line pt-5 text-[15px] font-bold text-ink">{t("Qurilmalar")}</h3>
          <ShareBar parts={deviceRows.slice(0, 3).map((d) => ({ label: d.device, value: d.visitors }))} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ActivityHeatmap visits={heat.visits} orders={heat.orders} days={heat.days} />
        <Card title={t("Eng koʻp sotilganlar")} actions={<Link href="/admin/products" className={linkClass}>{t("Katalog")}</Link>}>
          {top.length === 0 ? (
            <EmptyState title={t("Bu davrda sotuv yoʻq")}>{t("Buyurtmalar tushgach eng yaxshi mahsulotlar shu yerda chiqadi.")}</EmptyState>
          ) : (
            <ol className="flex flex-col gap-1">
              {top.map((p, i) => {
                const share = top[0].revenue ? (p.revenue / top[0].revenue) * 100 : 0;
                const body = (
                  <>
                    <span className="w-5 shrink-0 text-center text-[14px] font-semibold tabular-nums text-muted">{i + 1}</span>
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-tile">
                      {p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-1" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink">{p.name}</span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-tile"><span className="block h-full rounded-full bg-ink" style={{ width: `${Math.max(3, share)}%` }} /></span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[14px] font-semibold tabular-nums text-ink">{som(p.revenue)}</span>
                      <span className="block text-[12px] tabular-nums text-muted">{formatNumber(p.units)} dona</span>
                    </span>
                  </>
                );
                return (
                  <li key={p.slug}>
                    {p.id ? <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="-mx-2 flex items-center gap-3 rounded-[12px] px-2 py-2 hover:bg-tile">{body}</Link> : <div className="flex items-center gap-3 py-2">{body}</div>}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title={t("Kategoriyalar boʻyicha savdo")} actions={<Link href="/admin/categories" className={linkClass}>{t("Kategoriyalar")}</Link>}>
          <BarList rows={cats.map((c) => ({ label: c.name, value: c.revenue, note: t("{n} dona", { n: formatNumber(c.units) }), href: c.slug === "boshqa" ? undefined : `/admin/products?category=${c.slug}` }))} format={som} empty={t("Bu davrda sotuv yoʻq")} />
        </Card>
        <Card title={t("Soʻnggi buyurtmalar")} actions={<Link href="/admin/orders" className={linkClass}>{t("Hammasi")}</Link>}>
          {current.recentOrders.length === 0 ? (
            <EmptyState title={t("Bu davrda buyurtma yoʻq")} />
          ) : (
            <TableWrap>
              <table className={cn(tableClass, "min-w-[520px]")}>
                <thead><tr><th className={thClass}>{t("Buyurtma")}</th><th className={thClass}>{t("Mijoz")}</th><th className={thClass}>{t("Qachon")}</th><th className={thClass}>{t("Holat")}</th><th className={`${thClass} text-right`}>{t("Jami")}</th></tr></thead>
                <tbody>
                  {current.recentOrders.slice(0, 7).map((order) => (
                    <tr key={order.number ?? order.createdAt.toISOString()}>
                      <td className={tdClass}><Link href={`/admin/orders/${order.number}`} className={linkClass}>{order.number}</Link></td>
                      <td className={`${tdClass} max-w-[160px] truncate`}>{order.customer.name}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`} title={formatDateTime(order.createdAt)}>{timeAgo(order.createdAt)}</td>
                      <td className={tdClass}><Pill tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Pill></td>
                      <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </div>

      <section aria-label={t("Katalog")} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[20px] bg-tile px-5 py-4">
        <h2 className="text-[15px] font-bold text-ink">{t("Katalog")}</h2>
        {[
          { href: "/admin/products", label: "mahsulot", value: counts.products },
          { href: "/admin/products?filter=out", label: "tugagan", value: counts.outOfStock },
          { href: "/admin/products?filter=hidden", label: t("sotuvdan olingan"), value: counts.hidden },
          { href: "/admin/categories", label: "kategoriya", value: counts.categories },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            <b className="text-[16px] tabular-nums text-ink">{formatNumber(item.value)}</b> {item.label}
          </Link>
        ))}
        <span className="ml-auto flex flex-wrap gap-2">
          <Link href="/admin/categories" className={secondaryButtonClass.replace("bg-tile", "bg-white")}>{t("+ Kategoriya")}</Link>
          <Link href="/admin/products/new" className={buttonClass}>{t("+ Mahsulot")}</Link>
        </span>
      </section>
    </>
  );
}
