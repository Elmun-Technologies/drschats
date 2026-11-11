import Link from "next/link";
import { getOrderMetrics } from "@/lib/admin/metrics";
import { channels, devices, parseRange, percent, productInterest, siteFunnel, topPages, topSearches } from "@/lib/admin/crm";
import { activityHeatmap, trafficSeries } from "@/lib/admin/dashboard";
import { RangeTabs, ShareBar } from "@/components/admin/charts";
import { TrendChart } from "@/components/admin/TrendChart";
import { ActivityHeatmap } from "@/components/admin/ActivityHeatmap";
import { BarList, Card, EmptyState, Metric, PageHeader, TableWrap, linkClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Analitika");

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  await requireAdmin();
  const range = parseRange((await searchParams).range, 30);
  const [funnel, series, heat, channelRows, deviceRows, interest, pages, searches, metrics] = await Promise.all([
    siteFunnel(range),
    trafficSeries(range),
    activityHeatmap(range),
    channels(range),
    devices(range),
    productInterest(range, 12),
    topPages(range, 10),
    topSearches(range, 10),
    getOrderMetrics(range),
  ]);
  const f = funnel.current;
  const p = funnel.previous;

  return (
    <>
      <PageHeader
        title={t("Analitika")}
        lead={t("Saytning oʻz kuzatuvi: kim kirdi, nimani koʻrdi, qayerdan keldi va nima sotib oldi. GA4 va Metrika maʼlumotlari bilan bir qatorda ishlaydi.")}
        actions={<RangeTabs range={range} basePath="/admin/analytics" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <Metric label={t("Tashrif buyuruvchilar")} value={formatNumber(f.visitors)} delta={{ current: f.visitors, previous: p.visitors }} />
        <Metric label={t("Yangi")} value={formatNumber(funnel.newVisitors)} hint={t("birinchi marta kirgan")} />
        <Metric label={t("Sessiyalar")} value={formatNumber(f.sessions)} delta={{ current: f.sessions, previous: p.sessions }} />
        <Metric label={t("Sahifa koʻrishlar")} value={formatNumber(f.pageViews)} hint={f.sessions ? t("{n} sahifa / sessiya", { n: (f.pageViews / f.sessions).toFixed(1) }) : undefined} />
        <Metric label={t("Konversiya")} value={`${percent(f.purchased, f.visitors)}%`} hint={t("{n} ta xaridor", { n: formatNumber(f.purchased) })} />
        <Metric label={t("Savdo")} value={som(metrics.current.revenue)} delta={{ current: metrics.current.revenue, previous: metrics.previous.revenue }} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TrendChart current={series.current} previous={series.previous} unit={series.unit} periodLabel={range === 1 ? t("kun") : t("{n} kun", { n: range })} />
        <ActivityHeatmap visits={heat.visits} orders={heat.orders} days={heat.days} />
      </div>

      <Card title={t("Kanallar")} lead={t("Har bir manba qancha odam olib keldi va ulardan qanchasi sotib oldi")} className="mt-4">
        {channelRows.length === 0 ? (
          <EmptyState title={t("Hali tashrif yozilmagan")} />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>{t("Manba")}</th><th className={`${thClass} text-right`}>{t("Tashrif buyuruvchi")}</th><th className={`${thClass} text-right`}>{t("Xaridor")}</th><th className={`${thClass} text-right`}>{t("Konversiya")}</th><th className={`${thClass} text-right`}>{t("Savdo")}</th></tr></thead>
              <tbody>
                {channelRows.map((c) => (
                  <tr key={c.channel}>
                    <td className={`${tdClass} font-semibold`}>{t(c.channel)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(c.visitors)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(c.buyers)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{percent(c.buyers, c.visitors)}%</td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Card title={t("Mahsulotlar: qiziqish va xarid")} lead={t("Koʻp koʻrilib kam sotilayotgan mahsulot — narx, rasm yoki tavsifni tekshirish uchun signal")} className="mt-4">
        {interest.length === 0 ? (
          <EmptyState title={t("Maʼlumot yoʻq")} />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>{t("Mahsulot")}</th><th className={`${thClass} text-right`}>{t("Koʻrdi")}</th><th className={`${thClass} text-right`}>{t("Savatga qoʻshdi")}</th><th className={`${thClass} text-right`}>{t("Sotildi (dona)")}</th><th className={`${thClass} text-right`}>{t("Koʻrish → savat")}</th></tr></thead>
              <tbody>
                {interest.map((row) => (
                  <tr key={row.slug}>
                    <td className={`${tdClass} max-w-[320px] truncate`}><a href={`/uz/product/${row.slug}`} target="_blank" rel="noopener noreferrer" className={linkClass}>{row.name}</a></td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(row.views)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(row.carts)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(row.orders)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{row.views ? `${percent(row.carts, row.views)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t("Qurilmalar")}>
          <ShareBar parts={deviceRows.slice(0, 4).map((d) => ({ label: d.device, value: d.visitors }))} />
        </Card>
        <Card title={t("Koʻp ochilgan sahifalar")}>
          <BarList rows={pages.map((page) => ({ label: page.path, value: page.views, note: t("{n} kishi", { n: formatNumber(page.visitors) }) }))} />
        </Card>
        <Card title={t("Saytdagi qidiruvlar")} lead={t("Mijozlar nimani izlayapti")}>
          <BarList rows={searches.map((s) => ({ label: s.term, value: s.count, href: `/uz/search?q=${encodeURIComponent(s.term)}` }))} empty={t("Qidiruv hali yozilmagan")} />
        </Card>
      </div>

      <p className="mt-6 text-[13px] leading-5 text-muted">
        {t("Raqamlar saytning birinchi tomon kuzatuvidan olinadi (botlar va avtomatik tekshiruvlar sanalmaydi). Reklama kabinetlari uchun GA4, Metrika va Meta Pixel —")} <Link href="/admin/integrations" className={linkClass}>{t("Integratsiyalar")}</Link>.
      </p>
    </>
  );
}
