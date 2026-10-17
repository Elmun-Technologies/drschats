import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { flowEnrollments, flows } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { TRIGGER_INFO, isFlowTrigger, parseSteps } from "@/lib/flows/types";
import { DEFAULT_FLOWS } from "@/lib/flows/defaults";
import { PLACEHOLDERS, type Placeholder } from "@/lib/messaging/template";
import { conversion, flowEnrollmentStats, messageStats } from "@/lib/messaging/stats";
import { formatDateTime } from "@/lib/admin/order-labels";
import { maskPhone } from "@/lib/privacy";
import { toggleFlow } from "@/app/admin/_actions/flows";
import { FlowEditor } from "@/components/admin/FlowEditor";
import { Card, EmptyState, Metric, PageHeader, Pill, TableWrap, buttonClass, linkClass, secondaryButtonClass, somShort, tableClass, tdClass, thClass, timeAgo, type PillTone } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Avtomatlashtirish" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  active: { label: "Oqimda", tone: "outline" },
  converted: { label: "Buyurtma berdi", tone: "dark" },
  exited: { label: "Chiqdi", tone: "muted" },
  done: { label: "Tugadi", tone: "neutral" },
};

const EXIT: Record<string, string> = { opted_out: "obunadan chiqdi", cart_emptied: "savat boʻshadi", no_steps: "qadam yoʻq" };

/** Placeholders a trigger can fill; {kod}/{muddat}/{havola} work everywhere. */
function placeholdersFor(trigger: string): Placeholder[] {
  const cart = trigger === "cart_abandoned" || trigger === "checkout_dropped";
  return PLACEHOLDERS.filter((p) => (p === "summa" ? cart : p === "mahsulot" ? trigger === "restock" : p === "savat" ? trigger !== "restock" && trigger !== "lapsed" : true));
}

export default async function AdminFlowPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = getDb();
  const [flow] = await db.select().from(flows).where(eq(flows.id, id)).limit(1);
  if (!flow) notFound();
  const [stats, enrollStats, recent, settings] = await Promise.all([
    messageStats([`flow-${flow.id}`]),
    flowEnrollmentStats(),
    db.select().from(flowEnrollments).where(eq(flowEnrollments.flowId, flow.id)).orderBy(desc(flowEnrollments.enrolledAt)).limit(30),
    getRuntimeIntegrationSettings(),
  ]);
  const s = stats.get(`flow-${flow.id}`)!;
  const e = enrollStats.get(flow.id);
  const info = isFlowTrigger(flow.trigger) ? TRIGGER_INFO[flow.trigger] : null;
  const steps = parseSteps(flow.steps);
  const fallback = DEFAULT_FLOWS.find((f) => f.id === flow.id)?.steps ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Avtomatlashtirish"
        title={flow.name}
        lead={<>Ishga tushiruvchi: <b>{info?.title ?? flow.trigger}</b>. {flow.active ? "Yoqilgan — mos mijozlar oʻzi qoʻshiladi." : "Oʻchiq — hech kimga yuborilmaydi."}</>}
        actions={
          <>
            <Link href="/admin/flows" className={secondaryButtonClass}>← Barchasi</Link>
            <form action={toggleFlow}>
              <input type="hidden" name="id" value={flow.id} />
              <button type="submit" className={flow.active ? secondaryButtonClass : buttonClass}>{flow.active ? "Oʻchirish" : "Yoqish"}</button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Hozir oqimda" value={formatNumber(e?.activeNow ?? 0)} hint={`30 kunda ${formatNumber(e?.enrolled30 ?? 0)} ta kirdi`} />
        <Metric label="Yuborildi" value={formatNumber(s.sent)} hint={`${formatNumber(s.delivered)} yetkazildi · ${formatNumber(s.clicked)} bosildi`} />
        <Metric label="Buyurtma berib qaytdi" value={formatNumber(e?.converted30 ?? 0)} hint={`30 kun · ${somShort(e?.convertedRevenue30 ?? 0)}`} />
        <Metric label="Kod / havola orqali" value={formatNumber(s.orders)} hint={`${somShort(s.revenue)} · konversiya ${conversion(s.orders, s.sent)}`} />
      </div>

      <Card title="Qadamlar" lead={`Muddat ${info?.anchor ?? "ishga tushgan vaqtdan"} hisoblanadi. Mijoz buyurtma bersa yoki obunadan chiqsa, keyingi qadamlar yuborilmaydi.`} className="mt-4">
        <FlowEditor
          id={flow.id}
          name={flow.name}
          steps={steps.length ? steps : fallback}
          anchor={info?.anchor ?? "ishga tushgan vaqtdan"}
          placeholders={placeholdersFor(flow.trigger)}
          transliterate={settings.sms.transliterate}
        />
      </Card>

      <Card title="Oxirgi ishtirokchilar" lead="Telefon raqamlari yashirilgan" className="mt-4" actions={<Link href={`/admin/messages?flow=${flow.id}`} className={linkClass}>Xabarlari →</Link>}>
        {recent.length === 0 ? (
          <EmptyState title="Hali hech kim kirmagan">{flow.active ? "Shartga mos mijoz paydo boʻlishi bilan shu yerda koʻrinadi." : "Avtomatlashtirish yoqilgandan keyin mos mijozlar shu yerda koʻrinadi."}</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Mijoz</th><th className={thClass}>Holat</th><th className={thClass}>Qadam</th><th className={thClass}>Keyingisi</th><th className={thClass}>Kirdi</th></tr></thead>
              <tbody>
                {recent.map((r) => {
                  const st = STATUS[r.status] ?? STATUS.active;
                  return (
                    <tr key={r.id}>
                      <td className={`${tdClass} whitespace-nowrap tabular-nums`}><Link href={`/admin/customers/${r.subject}`} className={linkClass}>{maskPhone(r.subject)}</Link></td>
                      <td className={tdClass}>
                        <Pill tone={st.tone}>{st.label}</Pill>
                        {r.exitReason && <span className="ml-2 text-[13px] text-muted">{EXIT[r.exitReason] ?? r.exitReason}</span>}
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{Math.min(r.step, steps.length)} / {steps.length}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`}>{r.nextAt ? formatDateTime(r.nextAt) : "—"}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`} title={formatDateTime(r.enrolledAt)}>{timeAgo(r.enrolledAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
