import { BotTabs } from "@/components/admin/BotTabs";
import { Card, PageHeader, Pill, secondaryButtonClass } from "@/components/admin/ui";
import { retryJobAction } from "@/app/admin/_actions/bot";
import { formatDateTime } from "@/lib/admin/order-labels";
import { listJobs } from "@/lib/bot/store";

export const metadata = { title: "Xabarlar navbati" };

const KIND: Record<string, string> = { order_status: "Buyurtma holati", support: "Operator javobi", broadcast: "Klub xabari" };
const STATUS = { pending: "Kutmoqda", leased: "Yuborilmoqda", sent: "Yuborildi", failed: "Yuborilmadi", blocked: "Bloklangan" } as const;

export default async function BotOutboxPage() {
  const rows = await listJobs();
  return (
    <>
      <PageHeader title="Xabarlar navbati" lead="Sayt navbatga qoʻyadi, bot yuboradi. Oxirgi 100 ta." />
      <BotTabs active="/admin/bot/outbox" />
      <Card>
        {rows.length === 0 ? (
          <p className="text-[15px] text-ink-2">Navbat boʻsh.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-[15px]">
                <span className="w-[56px] font-semibold">#{j.id}</span>
                <span className="w-[140px]">{KIND[j.kind] ?? j.kind}</span>
                <span className="min-w-0 flex-1 truncate text-ink-2">{j.payload.text.replace(/<[^>]+>/g, "")}</span>
                <span className="w-[140px] text-[13px] text-muted">{formatDateTime(j.sentAt ?? j.createdAt)}</span>
                <Pill tone={j.status === "failed" || j.status === "blocked" ? "red" : j.status === "sent" ? "neutral" : "dark"}>
                  {STATUS[j.status]}
                </Pill>
                {(j.status === "failed" || j.status === "blocked") && (
                  <form action={retryJobAction}>
                    <input type="hidden" name="id" value={j.id} />
                    <button type="submit" className={secondaryButtonClass}>Qayta yuborish</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
