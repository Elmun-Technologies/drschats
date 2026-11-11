import Link from "next/link";
import type { stockMovements } from "@/lib/db/schema";
import { Card, TableWrap, tableClass, tdClass, thClass, timeAgo } from "@/components/admin/ui";
import { labels, t } from "@/lib/admin/i18n/server";

const REASON: Record<string, string> = labels({ order: "Buyurtma", cancel: "Bekor qilindi", manual: "Qoʻlda", import: "Import" });

/* The last movements of a tracked count, on the product's edit page. */
export function StockHistory({ rows }: { rows: (typeof stockMovements.$inferSelect)[] }) {
  return (
    <Card title={t("Ombor tarixi")} lead={t("Oxirgi oʻzgarishlar: buyurtmalar, bekor qilishlar va qoʻlda tuzatishlar")} className="mt-5">
      <TableWrap>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>{t("Qachon")}</th>
              <th className={thClass}>{t("Sabab")}</th>
              <th className={`${thClass} text-right`}>{t("Oʻzgarish")}</th>
              <th className={thClass}>{t("Izoh")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td className={tdClass} title={m.createdAt.toISOString()}>{timeAgo(m.createdAt)}</td>
                <td className={tdClass}>{REASON[m.reason] ?? m.reason}</td>
                <td className={`${tdClass} text-right font-semibold tabular-nums`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                <td className={`${tdClass} text-ink-2`}>
                  {m.orderId ? (
                    <Link href={`/admin/orders/GV-${String(m.orderId).padStart(6, "0")}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                      GV-{String(m.orderId).padStart(6, "0")}
                    </Link>
                  ) : (
                    // System notes (catalog.ts) are Uzbek keys; a note an admin typed comes back unchanged.
                    m.adminNote ? t(m.adminNote) : "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}
