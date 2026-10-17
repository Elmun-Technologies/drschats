import Link from "next/link";
import { ORDER_PERIODS, listOrders, orderStatusCounts, periodStart, type OrderPeriod } from "@/lib/admin/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { Card, ChipNav, EmptyState, Metric, PageHeader, Pill, TableWrap, buttonClass, inputClass, linkClass, secondaryButtonClass, som, somShort, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { cn, formatNumber } from "@/lib/utils";

export const metadata = { title: "Buyurtmalar" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string | string[]; q?: string | string[]; period?: string | string[] }> }) {
  const params = await searchParams;
  const status = first(params.status);
  const q = first(params.q)?.trim() ?? "";
  const active = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined;
  const periodParam = first(params.period) ?? "all";
  const period: OrderPeriod = periodParam in ORDER_PERIODS ? (periodParam as OrderPeriod) : "all";
  const from = periodStart(period);
  const [rows, { counts, revenue }] = await Promise.all([listOrders({ status: active, q, from }), orderStatusCounts(q, from)]);
  const query = (next: { status?: OrderStatus | null; period?: OrderPeriod }) => {
    const search = new URLSearchParams();
    const s = next.status === undefined ? active : next.status ?? undefined;
    if (s) search.set("status", s);
    if (q) search.set("q", q);
    const p = next.period ?? period;
    if (p !== "all") search.set("period", p);
    return search.toString();
  };
  const href = (s?: OrderStatus) => {
    const text = query({ status: s ?? null });
    return `/admin/orders${text ? `?${text}` : ""}`;
  };

  const live = counts.all - counts.cancelled;
  const average = live > 0 ? Math.round(revenue / live) : 0;

  return (
    <>
      <PageHeader
        title="Buyurtmalar"
        lead={<>{formatNumber(counts.all)} ta buyurtma · {som(revenue)} (bekor qilinganlarsiz)</>}
        actions={<a href={`/admin/orders/export?${query({})}`} className={secondaryButtonClass}>Excelʼga yuklash (CSV)</a>}
      />
      <nav aria-label="Davr" className="mb-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-[14px] bg-tile p-1">
        {(Object.keys(ORDER_PERIODS) as OrderPeriod[]).map((p) => {
          const text = query({ period: p });
          return (
            <Link
              key={p}
              href={`/admin/orders${text ? `?${text}` : ""}`}
              aria-current={p === period ? "page" : undefined}
              className={cn(
                "inline-flex h-11 shrink-0 items-center rounded-[12px] px-3.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                p === period ? "bg-ink text-white" : "text-ink-2 hover:bg-white hover:text-ink",
              )}
            >
              {ORDER_PERIODS[p]}
            </Link>
          );
        })}
      </nav>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Buyurtmalar" value={formatNumber(counts.all)} hint={`${formatNumber(counts.new)} ta yangi`} />
        <Metric label="Savdo summasi" value={somShort(revenue)} hint="bekor qilinganlarsiz" />
        <Metric label="Oʻrtacha chek" value={som(average)} />
        <Metric label="Bekor qilingan" value={`${counts.all ? Math.round((counts.cancelled / counts.all) * 100) : 0}%`} hint={`${formatNumber(counts.cancelled)} ta buyurtma`} />
      </div>
      <form role="search" action="/admin/orders" className="mb-4 flex flex-wrap gap-2">
        {active && <input type="hidden" name="status" value={active} />}
        {period !== "all" && <input type="hidden" name="period" value={period} />}
        <input name="q" defaultValue={q} placeholder="Raqam, ism, telefon yoki email" aria-label="Buyurtmalarni qidirish" className={`${inputClass} max-w-[440px]`} />
        <button type="submit" className={buttonClass}>Qidirish</button>
        {(q || active) && <Link href="/admin/orders" className={secondaryButtonClass}>Tozalash</Link>}
      </form>
      <ChipNav
        label="Holat boʻyicha"
        className="mb-4"
        items={[{ href: href(), label: "Hammasi", active: !active, count: counts.all }, ...ORDER_STATUSES.map((s) => ({ href: href(s), label: STATUS_LABEL[s], active: s === active, count: counts[s] }))]}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Buyurtma topilmadi" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Buyurtma</th><th className={thClass}>Mijoz</th><th className={thClass}>Manba</th><th className={thClass}>Holat</th><th className={`${thClass} text-right`}>Jami</th></tr></thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td className={tdClass}><Link href={`/admin/orders/${o.number}`} className={linkClass}>{o.number}</Link><span className="block text-[13px] text-muted">{formatDateTime(o.createdAt)}</span></td>
                    <td className={`${tdClass} max-w-[260px]`}><span className="block truncate">{o.customer.name}</span><span className="block text-[13px] text-muted">{o.customer.phone} · {o.items.reduce((sum, item) => sum + item.quantity, 0)} dona</span></td>
                    <td className={`${tdClass} max-w-[180px] truncate text-ink-2`}>{describeAttribution(o.attribution ?? undefined) || "Bevosita"}</td>
                    <td className={tdClass}><Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill></td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        {rows.length === 100 && <p className="mt-3 text-[13px] text-muted">Eng soʻnggi 100 ta koʻrsatildi — qidiruv yoki holat filtridan foydalaning.</p>}
      </Card>
    </>
  );
}
