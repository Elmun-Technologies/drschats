import Link from "next/link";
import { STAGE_LABEL } from "@/lib/journey/model";
import { VISITOR_FILTERS, listVisitors, parseVisitorFilter, type VisitorFilter } from "@/lib/admin/crm";
import { DEVICE_LABEL } from "@/lib/admin/event-labels";
import { ChipNav, Card, EmptyState, PageHeader, Pill, TableWrap, buttonClass, inputClass, linkClass, secondaryButtonClass, som, tableClass, tdClass, thClass, timeAgo } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Mijozlar yoʻli");

const PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminVisitorsPage({ searchParams }: { searchParams: Promise<{ filter?: string | string[]; q?: string | string[]; page?: string | string[] }> }) {
  await requireAdmin();
  const params = await searchParams;
  const filter = parseVisitorFilter(params.filter);
  const q = first(params.q)?.trim() ?? "";
  const page = Math.max(1, Math.min(200, Number(first(params.page)) || 1));
  const { rows, counts } = await listVisitors({ filter, q, page, pageSize: PAGE_SIZE });
  const qs = (next: Partial<{ filter: VisitorFilter; page: number }>) => {
    const search = new URLSearchParams();
    const f = next.filter ?? filter;
    if (f !== "all") search.set("filter", f);
    if (q) search.set("q", q);
    if (next.page && next.page > 1) search.set("page", String(next.page));
    const text = search.toString();
    return `/admin/visitors${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title={t("Mijozlar yoʻli")}
        lead={t("Saytga kirgan har bir odam: qayerdan keldi, nimani koʻrdi, qaysi bosqichda toʻxtadi. Telefon buyurtma paytida bogʻlanadi.")}
      />
      <form role="search" action="/admin/visitors" className="mb-4 flex flex-wrap gap-2">
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        <input name="q" defaultValue={q} placeholder={t("Ism yoki telefon raqami")} aria-label={t("Qidirish")} className={`${inputClass} max-w-[420px]`} />
        <button type="submit" className={buttonClass}>{t("Qidirish")}</button>
        {q && <Link href={qs({})} className={secondaryButtonClass}>{t("Tozalash")}</Link>}
      </form>
      <ChipNav
        label={t("Bosqich boʻyicha")}
        className="mb-4"
        items={(Object.keys(VISITOR_FILTERS) as VisitorFilter[]).map((key) => ({ href: qs({ filter: key }), label: t(VISITOR_FILTERS[key].label), active: key === filter, count: counts[key] }))}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title={t("Hech kim topilmadi")}>{t("Kuzatuv yoqilgandan keyingi tashriflar shu yerda chiqadi.")}</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t("Kim")}</th>
                  <th className={thClass}>{t("Bosqich")}</th>
                  <th className={thClass}>{t("Manba")}</th>
                  <th className={`${thClass} text-right`}>{t("Tashriflar")}</th>
                  <th className={`${thClass} text-right`}>{t("Savatda")}</th>
                  <th className={thClass}>{t("Oxirgi faollik")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td className={tdClass}>
                      <Link href={`/admin/visitors/${v.id}`} className={linkClass}>{v.name ?? (v.phone9 ? `+998 ${v.phone9}` : `Mehmon ${v.id.slice(0, 6)}`)}</Link>
                      <span className="block text-[13px] text-muted">{v.device ? DEVICE_LABEL[v.device] : ""}{v.locale ? ` · ${v.locale}` : ""}{v.phone9 && v.name ? ` · +998 ${v.phone9}` : ""}</span>
                    </td>
                    <td className={tdClass}><Pill tone={v.stage === "customer" ? "dark" : v.stage === "checkout" || v.stage === "cart" ? "outline" : "neutral"}>{STAGE_LABEL[v.stage]}</Pill></td>
                    <td className={`${tdClass} text-ink-2`}>{v.channel}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(v.sessions)}<span className="block text-[13px] text-muted">{formatNumber(v.pageViews)} sahifa</span></td>
                    <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{v.cartValue > 0 ? som(v.cartValue) : "—"}</td>
                    <td className={`${tdClass} whitespace-nowrap text-ink-2`} title={v.lastSeenAt.toISOString()}>{timeAgo(v.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        {(page > 1 || rows.length === PAGE_SIZE) && (
          <div className="mt-4 flex items-center justify-between gap-3">
            {page > 1 ? <Link href={qs({ page: page - 1 })} className={secondaryButtonClass}>{t("← Oldingi")}</Link> : <span />}
            <span className="text-[14px] text-muted">{page}-sahifa</span>
            {rows.length === PAGE_SIZE ? <Link href={qs({ page: page + 1 })} className={secondaryButtonClass}>{t("Keyingi →")}</Link> : <span />}
          </div>
        )}
      </Card>
    </>
  );
}
