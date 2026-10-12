import { BotTabs } from "@/components/admin/BotTabs";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/order-labels";
import { listMembers } from "@/lib/bot/store";

export const metadata = { title: "Klub aʼzolari" };

export default async function BotMembersPage() {
  const rows = await listMembers();
  return (
    <>
      <PageHeader title="Klub aʼzolari" lead="Botda /start bosganlar, oxirgi 200 ta" />
      <BotTabs active="/admin/bot/members" />
      <Card>
        {rows.length === 0 ? (
          <p className="text-[15px] text-ink-2">Hali aʼzo yoʻq.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map(({ m, phone, name, username, linkedAt }) => (
              <li key={m.chatId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-[15px]">
                <span className="min-w-0 flex-1 truncate">
                  {name || "—"}
                  {username && <span className="text-muted"> · @{username}</span>}
                </span>
                <span className="w-[150px]">{phone ? `+${phone}` : <span className="text-muted">raqamsiz</span>}</span>
                <span className="w-[60px] uppercase text-muted">{m.locale}</span>
                <span className="w-[140px] text-[13px] text-muted">{formatDateTime(linkedAt ?? m.createdAt)}</span>
                {m.source && <Pill>{m.source}</Pill>}
                {m.blockedAt && <Pill tone="red">Bloklagan</Pill>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
