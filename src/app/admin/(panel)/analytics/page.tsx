import Link from "next/link";
import { getOrderMetrics } from "@/lib/admin/metrics";
import { channels, dailyTraffic, devices, parseRange, percent, productInterest, siteFunnel, topPages, topSearches } from "@/lib/admin/crm";
import { DailyBars, RangeTabs } from "@/components/admin/charts";
import { BarList, Card, EmptyState, Metric, PageHeader, TableWrap, linkClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Analitika" };

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = parseRange((await searchParams).range, 30);
  const [funnel, daily, channelRows, deviceRows, interest, pages, searches, metrics] = await Promise.all([
    siteFunnel(range),
    dailyTraffic(range),
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
        title="Analitika"
        lead="Saytning oʻz kuzatuvi: kim kirdi, nimani koʻrdi, qayerdan keldi va nima sotib oldi. GA4 va Metrika maʼlumotlari bilan bir qatorda ishlaydi."
        actions={<RangeTabs range={range} basePath="/admin/analytics" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <Metric label="Tashrif buyuruvchilar" value={formatNumber(f.visitors)} delta={{ current: f.visitors, previous: p.visitors }} />
        <Metric label="Yangi" value={formatNumber(funnel.newVisitors)} hint="birinchi marta kirgan" />
        <Metric label="Sessiyalar" value={formatNumber(f.sessions)} delta={{ current: f.sessions, previous: p.sessions }} />
        <Metric label="Sahifa koʻrishlar" value={formatNumber(f.pageViews)} hint={f.sessions ? `${(f.pageViews / f.sessions).toFixed(1)} sahifa / sessiya` : undefined} />
        <Metric label="Konversiya" value={`${percent(f.purchased, f.visitors)}%`} hint={`${formatNumber(f.purchased)} ta xaridor`} />
        <Metric label="Savdo" value={som(metrics.current.revenue)} delta={{ current: metrics.current.revenue, previous: metrics.previous.revenue }} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <DailyBars title="Kunlik tashrif buyuruvchilar" data={daily.map((d) => ({ date: d.date, value: d.visitors }))} unit="kishi" />
        <DailyBars title="Kunlik buyurtmalar" data={daily.map((d) => ({ date: d.date, value: d.orders }))} unit="ta" />
      </div>

      <Card title="Kanallar" lead="Har bir manba qancha odam olib keldi va ulardan qanchasi sotib oldi" className="mt-4">
        {channelRows.length === 0 ? (
          <EmptyState title="Hali tashrif yozilmagan" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Manba</th><th className={`${thClass} text-right`}>Tashrif buyuruvchi</th><th className={`${thClass} text-right`}>Xaridor</th><th className={`${thClass} text-right`}>Konversiya</th><th className={`${thClass} text-right`}>Savdo</th></tr></thead>
              <tbody>
                {channelRows.map((c) => (
                  <tr key={c.channel}>
                    <td className={`${tdClass} font-semibold`}>{c.channel}</td>
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

      <Card title="Mahsulotlar: qiziqish va xarid" lead="Koʻp koʻrilib kam sotilayotgan mahsulot — narx, rasm yoki tavsifni tekshirish uchun signal" className="mt-4">
        {interest.length === 0 ? (
          <EmptyState title="Maʼlumot yoʻq" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Mahsulot</th><th className={`${thClass} text-right`}>Koʻrdi</th><th className={`${thClass} text-right`}>Savatga qoʻshdi</th><th className={`${thClass} text-right`}>Sotildi (dona)</th><th className={`${thClass} text-right`}>Koʻrish → savat</th></tr></thead>
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
        <Card title="Qurilmalar">
          <BarList rows={deviceRows.map((d) => ({ label: d.device, value: d.visitors, note: `${percent(d.visitors, f.visitors)}%` }))} />
        </Card>
        <Card title="Koʻp ochilgan sahifalar">
          <BarList rows={pages.map((page) => ({ label: page.path, value: page.views, note: `${formatNumber(page.visitors)} kishi` }))} />
        </Card>
        <Card title="Saytdagi qidiruvlar" lead="Mijozlar nimani izlayapti">
          <BarList rows={searches.map((s) => ({ label: s.term, value: s.count, href: `/uz/search?q=${encodeURIComponent(s.term)}` }))} empty="Qidiruv hali yozilmagan" />
        </Card>
      </div>

      <p className="mt-6 text-[13px] leading-5 text-muted">
        Raqamlar saytning birinchi tomon kuzatuvidan olinadi (botlar va avtomatik tekshiruvlar sanalmaydi). Reklama kabinetlari uchun GA4, Metrika va Meta Pixel — <Link href="/admin/integrations" className={linkClass}>Integratsiyalar</Link>.
      </p>
    </>
  );
}
