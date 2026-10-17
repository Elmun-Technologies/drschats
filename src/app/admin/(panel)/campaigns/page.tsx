import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { campaigns } from "@/lib/db/schema";
import { segmentById } from "@/lib/admin/segments";
import { formatDateTime } from "@/lib/admin/order-labels";
import { Card, EmptyState, PageHeader, Pill, TableWrap, buttonClass, linkClass, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Kampaniyalar" };

type Delivery = { sent: number; pending: number; failed: number };

async function deliveries(ids: number[]): Promise<Map<number, Delivery>> {
  const out = new Map<number, Delivery>();
  if (ids.length === 0) return out;
  const rows = (await getDb().execute(sql`
    select split_part(dedupe_key, ':', 2) as id,
           count(*) filter (where status = 'sent') as sent,
           count(*) filter (where status in ('pending', 'leased')) as pending,
           count(*) filter (where status in ('failed', 'blocked')) as failed
    from bot_jobs
    where kind = 'campaign' and split_part(dedupe_key, ':', 2) in (${sql.join(ids.map((id) => sql`${String(id)}`), sql`, `)})
    group by 1`)) as unknown as Record<string, string>[];
  for (const row of rows) out.set(Number(row.id), { sent: Number(row.sent), pending: Number(row.pending), failed: Number(row.failed) });
  return out;
}

export default async function AdminCampaignsPage() {
  const rows = await getDb().select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(100);
  const stats = await deliveries(rows.map((r) => r.id));
  return (
    <>
      <PageHeader
        title="Kampaniyalar"
        lead="Segmentlarga yuborilgan xabarlar va ularning yetkazilishi. Yangi kampaniya segment sahifasidan boshlanadi."
        actions={<Link href="/admin/segments" className={buttonClass}>+ Yangi kampaniya</Link>}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Hali kampaniya yuborilmagan" action={<Link href="/admin/segments" className={buttonClass}>Segment tanlash</Link>}>
            Masalan, «Kursi tugayapti» segmentiga takroriy buyurtma eslatmasi yuboring.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Kampaniya</th><th className={thClass}>Segment</th><th className={`${thClass} text-right`}>Auditoriya</th><th className={`${thClass} text-right`}>Yuborildi</th><th className={`${thClass} text-right`}>Navbatda</th><th className={`${thClass} text-right`}>Yetmadi</th><th className={thClass}>Sana</th></tr></thead>
              <tbody>
                {rows.map((c) => {
                  const d = stats.get(c.id) ?? { sent: 0, pending: 0, failed: 0 };
                  const segment = segmentById(c.segment);
                  return (
                    <tr key={c.id}>
                      <td className={tdClass}>
                        <span className="font-semibold">{c.name}</span>
                        <span className="block max-w-[340px] truncate text-[13px] text-muted" title={c.message}>{c.message}</span>
                      </td>
                      <td className={tdClass}>{segment ? <Link href={`/admin/segments/${segment.id}`} className={linkClass}>{segment.title}</Link> : c.segment}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(c.audience)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}><Pill tone="dark">{formatNumber(d.sent)}</Pill></td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(d.pending)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(d.failed)}</td>
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
        Xabarlar Telegram klub boti orqali ketadi va faqat botga ulangan, uni bloklamagan mijozlarga yetadi. «Yetmadi» — mijoz botni bloklagan yoki Telegram rad etgan. Navbat: <Link href="/admin/bot/outbox" className={linkClass}>Telegram klub → Xabarlar navbati</Link>.
      </p>
    </>
  );
}
