import { CampaignLinkBuilder } from "@/components/admin/CampaignLinkBuilder";
import { RangeTabs } from "@/components/admin/charts";
import { Card, EmptyState, PageHeader, TableWrap, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { parseRange, percent, utmCampaigns } from "@/lib/admin/crm";
import { SITE_URL } from "@/lib/config/site";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "UTM havolalar" };

export default async function AdminMarketingPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = parseRange((await searchParams).range, 30);
  const rows = await utmCampaigns(range);
  return (
    <>
      <PageHeader
        title="UTM havolalar"
        lead="Har bir reklama, post yoki xabar uchun alohida havola yarating — qaysi biri odam olib kelib, savdo qilganini quyidagi jadvalda koʻrasiz."
        actions={<RangeTabs range={range} basePath="/admin/marketing" />}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <CampaignLinkBuilder baseUrl={SITE_URL} />
        <Card title="Kampaniyalar natijasi" lead="utm_campaign boʻyicha, saytning oʻz kuzatuvidan">
          {rows.length === 0 ? (
            <EmptyState title="UTM bilan kelgan tashrif hali yoʻq">Chapdagi forma bilan havola yarating va reklamada ishlating.</EmptyState>
          ) : (
            <TableWrap>
              <table className={tableClass}>
                <thead><tr><th className={thClass}>Kampaniya</th><th className={thClass}>Manba</th><th className={`${thClass} text-right`}>Tashrif</th><th className={`${thClass} text-right`}>Xaridor</th><th className={`${thClass} text-right`}>Savdo</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.campaign}-${r.source}`}>
                      <td className={`${tdClass} font-semibold`}>{r.campaign}</td>
                      <td className={`${tdClass} text-ink-2`}>{r.source}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.visitors)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.buyers)} <span className="text-muted">({percent(r.buyers, r.visitors)}%)</span></td>
                      <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </div>
    </>
  );
}
