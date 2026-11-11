import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminAuditLog } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { formatDateTime } from "@/lib/admin/order-labels";
import { AUDIT_ACTION_LABEL } from "@/lib/admin/audit-labels";
import { Card, EmptyState, PageHeader, TableWrap, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Audit jurnali");
export const dynamic = "force-dynamic";

/* Owner only (lib/admin/roles.ts): who changed what, when, from where. */
export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  await requireAdmin();
  const filter = (await searchParams).action?.slice(0, 60);
  const rows = await getDb()
    .select()
    .from(adminAuditLog)
    .where(filter ? eq(adminAuditLog.action, filter) : undefined)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(300);
  return (
    <>
      <PageHeader title={t("Audit jurnali")} lead={t("Panelda kim nima oʻzgartirgani: kirishlar, buyurtma holatlari, narx va katalog, kalitlar, administratorlar. Oxirgi 300 ta yozuv.")} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title={t("Hali yozuv yoʻq")}>{t("Panelda oʻzgarish qilinishi bilan shu yerda koʻrinadi.")}</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr><th className={thClass}>{t("Vaqt")}</th><th className={thClass}>{t("Kim")}</th><th className={thClass}>{t("Nima")}</th><th className={thClass}>{t("Obyekt")}</th><th className={thClass}>{t("IP")}</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(r.createdAt)}</td>
                    <td className={tdClass}>{r.adminEmail ?? "—"}</td>
                    <td className={tdClass}>
                      <a href={`/admin/audit?action=${encodeURIComponent(r.action)}`} className="font-semibold text-ink hover:underline">{AUDIT_ACTION_LABEL[r.action] ?? r.action}</a>
                      {r.detail ? <span className="block text-[13px] text-muted">{describe(r.detail)}</span> : null}
                    </td>
                    <td className={tdClass}>{r.target ?? "—"}</td>
                    <td className={`${tdClass} text-[13px] text-muted`}>{r.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}

function describe(detail: unknown): string {
  if (!detail || typeof detail !== "object") return "";
  return Object.entries(detail as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : typeof v === "object" && v ? JSON.stringify(v) : String(v)}`)
    .join(" · ")
    .slice(0, 240);
}
