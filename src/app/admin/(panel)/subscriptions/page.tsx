import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { listSubscriptions, subscriptionCounts } from "@/lib/subscription/server";
import { subscriptionAction } from "@/app/admin/_actions/reviews";
import { Card, ChipNav, EmptyState, Metric, PageHeader, Pill, TableWrap, linkClass, secondaryButtonClass, smallButtonClass, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Obunalar");
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "due", label: "3 kun ichida" },
  { key: "active", label: "Faol" },
  { key: "cancelled", label: "Bekor qilingan" },
  { key: "all", label: "Hammasi" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

const DAY_MS = 24 * 60 * 60 * 1000;

function dueLabel(at: Date, now = Date.now()): string {
  const days = Math.round((at.getTime() - now) / DAY_MS);
  if (days < 0) return `${-days} kun oʻtdi`;
  if (days === 0) return "bugun";
  return `${days} kundan keyin`;
}

/*
  «Obuna» lines of site orders (lib/subscription/server.ts). Nothing renews by
  itself: the operator calls the customer when a delivery is due, places the
  repeat order with the recurring discount and presses «Yetkazildi», which
  moves the next date one interval on. The opt-in «Obuna: keyingi yetkazish»
  flow (/admin/flows) can remind the customer as well.
*/
export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin();
  const param = (await searchParams).f;
  const filter: Filter = FILTERS.some((f) => f.key === param) ? (param as Filter) : "due";
  const [counts, rows] = await Promise.all([subscriptionCounts(), listSubscriptions(filter)]);
  const now = Date.now();

  return (
    <>
      <PageHeader
        title={t("Obunalar")}
        lead={t("Mijoz «obuna» bilan buyurtma qilgan mahsulotlar. Keyingi yetkazish sanasi kelganda mijozga qoʻngʻiroq qiling, takroriy buyurtmani rasmiylashtiring va «Yetkazildi» ni bosing — keyingi sana bir oraliqqa suriladi. Avtomatik toʻlov yoki joʻnatish yoʻq.")}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={t("Faol obunalar")} value={formatNumber(counts.active)} />
        <Metric label={t("3 kun ichida navbat")} value={formatNumber(counts.due)} hint={t("muddati oʻtganlar ham")} />
      </div>
      <Card>
        <ChipNav label={t("Saralash")} className="mb-4" items={FILTERS.map((f) => ({ href: `/admin/subscriptions?f=${f.key}`, label: t(f.label), active: f.key === filter }))} />
        {rows.length === 0 ? (
          <EmptyState title={filter === "due" ? "Yaqin kunlarda navbatdagi yetkazish yoʻq" : "Obuna yoʻq"}>
            {t("Mijoz mahsulot sahifasida «Obuna bilan» tanlab buyurtma bersa, obuna shu yerda paydo boʻladi.")}
          </EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t("Keyingi yetkazish")}</th>
                  <th className={thClass}>{t("Mahsulot")}</th>
                  <th className={thClass}>{t("Mijoz")}</th>
                  <th className={thClass}>{t("Oraliq")}</th>
                  <th className={thClass}>{t("Oxirgi buyurtma")}</th>
                  <th className={`${thClass} text-right`} aria-label={t("Amal")} />
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const stale = s.lastOrderStatus === "cancelled";
                  return (
                    <tr key={s.id}>
                      <td className={tdClass}>
                        <span className="font-semibold">{s.nextDueAt.toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" })}</span>
                        <span className="block text-[13px] text-muted">{s.status === "active" ? dueLabel(s.nextDueAt, now) : "—"}</span>
                      </td>
                      <td className={tdClass}>
                        {s.productName} <span className="text-muted">× {s.quantity}</span>
                      </td>
                      <td className={tdClass}>
                        <Link href={`/admin/customers/${s.phone9}`} className={linkClass}>{s.customerName || `••• ${s.phone9.slice(-4)}`}</Link>
                      </td>
                      <td className={tdClass}>har {s.intervalDays} kun</td>
                      <td className={tdClass}>
                        {s.lastOrderNumber ? (
                          <Link href={`/admin/orders/${s.lastOrderNumber}`} className={linkClass}>{s.lastOrderNumber}</Link>
                        ) : (
                          "—"
                        )}
                        {stale && <Pill tone="outline" className="ml-2">{t("bekor qilingan")}</Pill>}
                        {s.status === "cancelled" && <Pill tone="muted" className="ml-2">{t("obuna tugagan")}</Pill>}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        {s.status === "active" && (
                          <div className="flex justify-end gap-2">
                            <form action={subscriptionAction}>
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="op" value="advance" />
                              <button type="submit" className={smallButtonClass} disabled={stale}>{t("Yetkazildi")}</button>
                            </form>
                            <form action={subscriptionAction}>
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="op" value="cancel" />
                              <button type="submit" className={secondaryButtonClass}>{t("Bekor qilish")}</button>
                            </form>
                          </div>
                        )}
                      </td>
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
