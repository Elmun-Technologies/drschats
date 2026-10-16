import Link from "next/link";
import { listOrders } from "@/lib/admin/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { Card, PageHeader, Pill, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/ui";
import { cn, formatNumber } from "@/lib/utils";

export const metadata = { title: "Buyurtmalar" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const active = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined;
  const rows = await listOrders({ status: active, q });

  return (
    <>
      <PageHeader title="Buyurtmalar" lead={`${rows.length}${rows.length === 100 ? "+" : ""} ta soʻnggi buyurtma${q ? ` · «${q}» boʻyicha` : ""}`} />
      <form role="search" action="/admin/orders" className="mb-4 flex flex-wrap gap-2">
        {active && <input type="hidden" name="status" value={active} />}
        <input name="q" defaultValue={q} placeholder="Buyurtma raqami, ism, telefon yoki email" aria-label="Buyurtmalarni qidirish" className={`${inputClass} max-w-[460px]`} />
        <button type="submit" className={buttonClass}>Qidirish</button>
        {(q || active) && <Link href="/admin/orders" className={secondaryButtonClass}>Filtrni tozalash</Link>}
      </form>
      <nav aria-label="Holat boʻyicha" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}` : q ? `/admin/orders?q=${encodeURIComponent(q)}` : "/admin/orders"}
            aria-current={s === active ? "page" : undefined}
            className={cn("flex h-11 items-center rounded-sm px-4 text-[15px]", s === active ? "bg-forest font-semibold text-white" : "bg-bg text-ink-2")}
          >
            {s ? STATUS_LABEL[s] : "Hammasi"}
          </Link>
        ))}
      </nav>
      <Card>
        {rows.length === 0 ? (
          <p className="text-[15px] text-ink-2">Buyurtma yoʻq.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-tile/60">
                  <span className="w-[96px] font-semibold">{o.number}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px]">{o.customer.name} · {o.customer.phone}</span>
                  <span className="text-[13px] text-muted">{formatDateTime(o.createdAt)}</span>
                  <Pill tone={o.status === "new" ? "dark" : o.status === "cancelled" ? "red" : "neutral"}>{STATUS_LABEL[o.status]}</Pill>
                  <span className="w-[120px] text-right font-semibold">{formatNumber(o.total)} soʻm</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
