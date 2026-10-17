import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { campaigns, type CampaignChannel } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { segmentById } from "@/lib/admin/segments";
import { formatDateTime } from "@/lib/admin/order-labels";
import { conversion, messageStats, type MessageStats } from "@/lib/messaging/stats";
import { Card, EmptyState, PageHeader, Pill, TableWrap, buttonClass, linkClass, somShort, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Kampaniyalar" };
export const dynamic = "force-dynamic";

const CHANNEL: Record<CampaignChannel, string> = { telegram: "Telegram", sms: "SMS", telegram_then_sms: "Telegram → SMS" };

type Legacy = { sent: number; pending: number; failed: number };

/* Campaigns sent before the outbox (0010) went straight to bot_jobs; their delivery is counted there. */
async function legacyDeliveries(ids: number[]): Promise<Map<number, Legacy>> {
  const out = new Map<number, Legacy>();
  if (ids.length === 0) return out;
  const rows = (await getDb().execute(sql`
    select split_part(dedupe_key, ':', 2) as id,
           count(*) filter (where status = 'sent') as sent,
           count(*) filter (where status in ('pending', 'leased')) as pending,
           count(*) filter (where status in ('failed', 'blocked')) as failed
    from bot_jobs
    where kind = 'campaign' and split_part(dedupe_key, ':', 2) in (${sql.join(ids.map((id) => sql`${String(id)}`), sql`, `)})
      and not exists (select 1 from outbound_messages m where m.bot_job_id = bot_jobs.id)
    group by 1`)) as unknown as Record<string, string>[];
  for (const row of rows) out.set(Number(row.id), { sent: Number(row.sent), pending: Number(row.pending), failed: Number(row.failed) });
  return out;
}

export default async function AdminCampaignsPage() {
  await requireAdmin();
  const rows = await getDb().select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(100);
  const [stats, legacy] = await Promise.all([messageStats(rows.map((r) => `campaign-${r.id}`)), legacyDeliveries(rows.map((r) => r.id))]);
  return (
    <>
      <PageHeader
        title="Kampaniyalar"
        lead="Segmentlarga yuborilgan xabarlar: yetkazilishi, bosilishi va olib kelgan buyurtmalari. Yangi kampaniya segment sahifasidan boshlanadi."
        actions={<Link href="/admin/segments" className={buttonClass}>+ Yangi kampaniya</Link>}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Hali kampaniya yuborilmagan" action={<Link href="/admin/segments" className={buttonClass}>Segment tanlash</Link>}>
            Masalan, «Kursi tugayapti» segmentiga takroriy buyurtma eslatmasi yuboring.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className={`${tableClass} min-w-[980px]`}>
              <thead>
                <tr>
                  <th className={thClass}>Kampaniya</th>
                  <th className={thClass}>Segment</th>
                  <th className={`${thClass} text-right`}>Auditoriya</th>
                  <th className={`${thClass} text-right`}>Yuborildi</th>
                  <th className={`${thClass} text-right`}>Yetkazildi</th>
                  <th className={`${thClass} text-right`}>Bosildi</th>
                  <th className={`${thClass} text-right`}>Buyurtma</th>
                  <th className={`${thClass} text-right`}>Tushum</th>
                  <th className={`${thClass} text-right`}>Konversiya</th>
                  <th className={thClass}>Sana</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const s: MessageStats = stats.get(`campaign-${c.id}`)!;
                  const old = legacy.get(c.id);
                  const sent = s.sent + (old?.sent ?? 0);
                  const pending = s.pending + (old?.pending ?? 0);
                  const failed = s.failed + (old?.failed ?? 0);
                  const segment = segmentById(c.segment);
                  return (
                    <tr key={c.id}>
                      <td className={tdClass}>
                        <span className="flex flex-wrap items-center gap-2 font-semibold">
                          {c.name} <Pill tone="outline">{CHANNEL[c.channel] ?? c.channel}</Pill>
                          {c.promo && <Pill tone="dark">{c.promo.kind === "percent" ? `−${c.promo.value}%` : `−${formatNumber(c.promo.value)} soʻm`}</Pill>}
                        </span>
                        <span className="block max-w-[320px] truncate text-[13px] text-muted" title={c.message}>{c.message}</span>
                        {(pending > 0 || failed > 0 || s.skipped > 0) && (
                          <span className="block text-[13px] text-muted">
                            {pending > 0 && `${formatNumber(pending)} navbatda `}{failed > 0 && `· ${formatNumber(failed)} yetmadi `}{s.skipped > 0 && `· ${formatNumber(s.skipped)} oʻtkazildi`}
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>{segment ? <Link href={`/admin/segments/${segment.id}`} className={linkClass}>{segment.title}</Link> : c.segment}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(c.audience)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}><Link href={`/admin/messages?campaign=${c.id}`} className={linkClass}>{formatNumber(sent)}</Link></td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(s.delivered + (old?.sent ?? 0))}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(s.clicked)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(s.orders)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{somShort(s.revenue)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{conversion(s.orders, sent)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`}>{formatDateTime(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
      <p className="mt-4 text-[13px] leading-5 text-muted">
        «Buyurtma» — kampaniya bergan shaxsiy promokod bilan yoki xabardagi havola orqali (utm_campaign=campaign-…) kelgan, bekor qilinmagan buyurtmalar. Telegram xabarlari klub boti orqali ketadi (<Link href="/admin/bot/outbox" className={linkClass}>Xabarlar navbati</Link>), SMS — Eskiz orqali. Har bir xabar: <Link href="/admin/messages" className={linkClass}>Xabarlar jurnali</Link>.
      </p>
    </>
  );
}
