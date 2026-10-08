import Link from "next/link";
import { listOrders } from "@/lib/admin/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { cn, formatNumber } from "@/lib/utils";

export const metadata = { title: "Buyurtmalar" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined;
  const rows = await listOrders({ status: active });

  return (
    <>
      <PageHeader title="Buyurtmalar" lead="Oxirgi 100 ta" />
      <nav aria-label="Holat boʻyicha" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            aria-current={s === active ? "page" : undefined}
            className={cn("flex h-11 items-center rounded-sm px-4 text-[15px]", s === active ? "bg-ink font-semibold text-white" : "bg-bg text-ink-2")}
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
