import Link from "next/link";
import { listOrders, orderStatusCounts } from "@/lib/admin/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { Card, ChipNav, EmptyState, PageHeader, Pill, TableWrap, buttonClass, inputClass, linkClass, secondaryButtonClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";

export const metadata = { title: "Buyurtmalar" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const status = first(params.status);
  const q = first(params.q)?.trim() ?? "";
  const active = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined;
  const [rows, counts] = await Promise.all([listOrders({ status: active, q }), orderStatusCounts(q)]);
  const href = (s?: OrderStatus) => {
    const search = new URLSearchParams();
    if (s) search.set("status", s);
    if (q) search.set("q", q);
    const text = search.toString();
    return `/admin/orders${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Buyurtmalar" lead="Har bir buyurtma: kim, nima, qayerdan kelgan va hozir qaysi holatda." />
      <form role="search" action="/admin/orders" className="mb-4 flex flex-wrap gap-2">
        {active && <input type="hidden" name="status" value={active} />}
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
