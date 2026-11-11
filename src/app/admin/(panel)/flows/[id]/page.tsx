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
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Avtomatlashtirish");
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
  const anchor = t(info?.anchor ?? "ishga tushgan vaqtdan");

  return (
    <>
      <PageHeader
        eyebrow={t("Avtomatlashtirish")}
        title={flow.name}
        lead={<>{t("Ishga tushiruvchi:")} <b>{info ? t(info.title) : flow.trigger}</b>. {flow.active ? t("Yoqilgan — mos mijozlar oʻzi qoʻshiladi.") : t("Oʻchiq — hech kimga yuborilmaydi.")}</>}
        actions={
          <>
            <Link href="/admin/flows" className={secondaryButtonClass}>{t("← Barchasi")}</Link>
            <form action={toggleFlow}>
              <input type="hidden" name="id" value={flow.id} />
              <button type="submit" className={flow.active ? secondaryButtonClass : buttonClass}>{flow.active ? t("Oʻchirib qoʻyish") : t("Yoqish")}</button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={t("Hozir oqimda")} value={formatNumber(e?.activeNow ?? 0)} hint={t("30 kunda {n} ta kirdi", { n: formatNumber(e?.enrolled30 ?? 0) })} />
        <Metric label={t("Yuborildi")} value={formatNumber(s.sent)} hint={t("{delivered} yetkazildi · {clicked} bosildi", { delivered: formatNumber(s.delivered), clicked: formatNumber(s.clicked) })} />
        <Metric label={t("Buyurtma berib qaytdi")} value={formatNumber(e?.converted30 ?? 0)} hint={t("30 kun · {sum}", { sum: somShort(e?.convertedRevenue30 ?? 0) })} />
        <Metric label={t("Kod / havola orqali")} value={formatNumber(s.orders)} hint={t("{sum} · konversiya {rate}", { sum: somShort(s.revenue), rate: conversion(s.orders, s.sent) })} />
      </div>

      <Card title={t("Qadamlar")} lead={t("Muddat {anchor} hisoblanadi. Mijoz buyurtma bersa yoki obunadan chiqsa, keyingi qadamlar yuborilmaydi.", { anchor })} className="mt-4">
        <FlowEditor
          id={flow.id}
          name={flow.name}
          steps={steps.length ? steps : fallback}
          anchor={anchor}
          placeholders={placeholdersFor(flow.trigger)}
          transliterate={settings.sms.transliterate}
        />
      </Card>

      <Card title={t("Oxirgi ishtirokchilar")} lead={t("Telefon raqamlari yashirilgan")} className="mt-4" actions={<Link href={`/admin/messages?flow=${flow.id}`} className={linkClass}>{t("Xabarlari →")}</Link>}>
        {recent.length === 0 ? (
          <EmptyState title={t("Hali hech kim kirmagan")}>{flow.active ? t("Shartga mos mijoz paydo boʻlishi bilan shu yerda koʻrinadi.") : t("Avtomatlashtirish yoqilgandan keyin mos mijozlar shu yerda koʻrinadi.")}</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>{t("Mijoz")}</th><th className={thClass}>{t("Holat")}</th><th className={thClass}>{t("Qadam")}</th><th className={thClass}>{t("Keyingisi")}</th><th className={thClass}>{t("Kirdi")}</th></tr></thead>
              <tbody>
                {recent.map((r) => {
                  const st = STATUS[r.status] ?? STATUS.active;
                  return (
                    <tr key={r.id}>
                      <td className={`${tdClass} whitespace-nowrap tabular-nums`}><Link href={`/admin/customers/${r.subject}`} className={linkClass}>{maskPhone(r.subject)}</Link></td>
                      <td className={tdClass}>
                        <Pill tone={st.tone}>{t(st.label)}</Pill>
                        {r.exitReason && <span className="ml-2 text-[13px] text-muted">{EXIT[r.exitReason] ? t(EXIT[r.exitReason]) : r.exitReason}</span>}
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
