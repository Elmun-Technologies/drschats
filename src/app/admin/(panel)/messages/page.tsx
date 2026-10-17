import Link from "next/link";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { flows, MESSAGE_CHANNELS, MESSAGE_STATUSES, outboundMessages, type MessageStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { formatDateTime } from "@/lib/admin/order-labels";
import { maskPhone } from "@/lib/privacy";
import { optOutCount } from "@/lib/messaging/optout";
import { Card, ChipNav, EmptyState, PageHeader, Pill, TableWrap, linkClass, secondaryButtonClass, tableClass, tdClass, thClass, type PillTone } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Xabarlar" };
export const dynamic = "force-dynamic";

type Search = { channel?: string; status?: string; flow?: string; campaign?: string };

const STATUS: Record<MessageStatus, { label: string; tone: PillTone }> = {
  pending: { label: "Navbatda", tone: "outline" },
  sending: { label: "Yuborilmoqda", tone: "outline" },
  sent: { label: "Yuborildi", tone: "dark" },
  failed: { label: "Xato", tone: "neutral" },
  skipped: { label: "Oʻtkazildi", tone: "muted" },
};

const REASONS: Record<string, string> = {
  opted_out: "mijoz obunadan chiqqan",
  sms_not_configured: "SMS ulanmagan",
  no_telegram: "Telegram ulanmagan",
  club_disabled: "Telegram klub oʻchiq",
  bot_blocked: "botni bloklagan",
  promo_needs_phone: "kod uchun telefon yoʻq",
};

function href(base: Search, patch: Search): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...patch })) if (v) params.set(k, v);
  const q = params.toString();
  return q ? `/admin/messages?${q}` : "/admin/messages";
}

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const params = await searchParams;
  const channel = (MESSAGE_CHANNELS as readonly string[]).includes(params.channel ?? "") ? params.channel : undefined;
  const status = (MESSAGE_STATUSES as readonly string[]).includes(params.status ?? "") ? (params.status as MessageStatus) : undefined;
  const flow = /^[a-z0-9-]{2,40}$/.test(params.flow ?? "") ? params.flow : undefined;
  const campaign = /^\d{1,12}$/.test(params.campaign ?? "") ? params.campaign : undefined;
  const current: Search = { channel, status, flow, campaign };

  const where: SQL[] = [];
  if (channel) where.push(eq(outboundMessages.channel, channel as "sms" | "telegram"));
  if (status) where.push(eq(outboundMessages.status, status));
  if (flow) where.push(eq(outboundMessages.flowId, flow));
  if (campaign) where.push(eq(outboundMessages.campaignId, Number(campaign)));

  const db = getDb();
  const [rows, counts, flowRows, optouts] = await Promise.all([
    db.select().from(outboundMessages).where(where.length ? and(...where) : undefined).orderBy(desc(outboundMessages.createdAt)).limit(200),
    db.execute(sql`select status, count(*) as n from outbound_messages where created_at > now() - interval '30 days' group by status`) as unknown as Promise<{ status: string; n: string }[]>,
    db.select({ id: flows.id, name: flows.name }).from(flows),
    optOutCount(),
  ]);
  const count = (s: string) => Number(counts.find((c) => c.status === s)?.n ?? 0);
  const flowName = new Map(flowRows.map((f) => [f.id, f.name]));

  return (
    <>
      <PageHeader
        title="Xabarlar"
        lead="Avtomatlashtirish va kampaniyalar yuborgan har bir SMS va Telegram xabari. Telefon raqamlari yashirilgan."
        actions={<Link href="/admin/flows" className={secondaryButtonClass}>Avtomatlashtirish</Link>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(["sent", "pending", "failed", "skipped"] as const).map((s) => (
          <Link key={s} href={href(current, { status: s })} className="block min-w-0 rounded-[20px] bg-tile p-4 transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
            <p className="text-[14px] text-ink-2">{STATUS[s].label}, 30 kun</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-ink">{formatNumber(count(s))}</p>
          </Link>
        ))}
        <div className="min-w-0 rounded-[20px] bg-tile p-4">
          <p className="text-[14px] text-ink-2">Obunadan chiqqan</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-ink">{formatNumber(optouts)}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2">
        <ChipNav
          label="Kanal"
          items={[
            { href: href(current, { channel: undefined }), label: "Barcha kanallar", active: !channel },
            { href: href(current, { channel: "sms" }), label: "SMS", active: channel === "sms" },
            { href: href(current, { channel: "telegram" }), label: "Telegram", active: channel === "telegram" },
          ]}
        />
        <ChipNav
          label="Holat"
          items={[
            { href: href(current, { status: undefined }), label: "Barcha holatlar", active: !status },
            ...MESSAGE_STATUSES.filter((s) => s !== "sending").map((s) => ({ href: href(current, { status: s }), label: STATUS[s].label, active: status === s })),
          ]}
        />
        <ChipNav
          label="Manba"
          items={[
            { href: href(current, { flow: undefined, campaign: undefined }), label: "Hammasi", active: !flow && !campaign },
            ...flowRows.map((f) => ({ href: href({ ...current, campaign: undefined }, { flow: f.id }), label: f.name, active: flow === f.id })),
            ...(campaign ? [{ href: href(current, {}), label: `Kampaniya #${campaign}`, active: true }] : []),
          ]}
        />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Xabar yoʻq">Avtomatlashtirish yoqilganda yoki kampaniya yuborilganda xabarlar shu yerda paydo boʻladi.</EmptyState>
        ) : (
          <TableWrap>
            <table className={`${tableClass} min-w-[880px]`}>
              <thead>
                <tr>
                  <th className={thClass}>Vaqt</th>
                  <th className={thClass}>Kimga</th>
                  <th className={thClass}>Manba</th>
                  <th className={thClass}>Matn</th>
                  <th className={thClass}>Holat</th>
                  <th className={`${thClass} text-right`}>Bosildi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const st = STATUS[m.status];
                  return (
                    <tr key={m.id}>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`}>
                        {formatDateTime(m.sentAt ?? m.scheduledAt)}
                        {m.status === "pending" && m.scheduledAt > new Date() && <span className="block text-[13px] text-muted">rejada</span>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        <span className="tabular-nums">{maskPhone(m.phone9)}</span>
                        <span className="block text-[13px] text-muted">{m.channel === "sms" ? "SMS" : "Telegram"} · {m.locale}</span>
                      </td>
                      <td className={tdClass}>
                        {m.flowId ? (
                          <Link href={`/admin/flows/${m.flowId}`} className={linkClass}>{flowName.get(m.flowId) ?? m.flowId}</Link>
                        ) : m.campaignId ? (
                          <Link href={`/admin/campaigns`} className={linkClass}>Kampaniya #{m.campaignId}</Link>
                        ) : "—"}
                        {m.flowStep != null && <span className="block text-[13px] text-muted">{m.flowStep + 1}-qadam</span>}
                        {m.promoCode && <span className="block font-mono text-[13px] text-ink-2">{m.promoCode}</span>}
                      </td>
                      <td className={tdClass}>
                        <span className="line-clamp-2 block max-w-[380px] text-[13px] leading-[18px] text-ink-2" title={m.text}>{m.text}</span>
                      </td>
                      <td className={tdClass}>
                        <Pill tone={st.tone}>{st.label}</Pill>
                        {m.error && <span className="mt-1 block max-w-[200px] text-[13px] leading-[17px] text-muted">{REASONS[m.error] ?? m.error}</span>}
                        {m.attempts > 1 && <span className="block text-[13px] text-muted">{m.attempts} urinish</span>}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{m.clicks > 0 ? formatNumber(m.clicks) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
      <p className="mt-4 text-[13px] leading-5 text-muted">
        SMS uchun «Yuborildi» — Eskiz qabul qildi. Telegram uchun — xabar klub botining navbatiga berildi; yetkazilishi <Link href="/admin/bot/outbox" className={linkClass}>Telegram klub → Xabarlar navbati</Link> da. Tungi vaqtda (21:00–09:00) navbat ertalabga suriladi.
      </p>
    </>
  );
}
