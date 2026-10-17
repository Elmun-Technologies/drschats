import Link from "next/link";
import Image from "next/image";
import { listOrders, listProducts } from "@/lib/admin/queries";
import { listCustomers } from "@/lib/admin/customers";
import { listVisitors } from "@/lib/admin/crm";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { Card, EmptyState, PageHeader, Pill, buttonClass, inputClass, som, timeAgo } from "@/components/admin/ui";

export const metadata = { title: "Qidiruv" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const rowClass = "-mx-2 flex items-center justify-between gap-3 rounded-[12px] px-2 py-2.5 hover:bg-tile";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = first((await searchParams).q)?.trim().slice(0, 80) ?? "";
  const [orders, customers, products, visitors] = q.length >= 2
    ? await Promise.all([listOrders({ q, limit: 8 }), listCustomers(q, 8), listProducts(q).then((rows) => rows.slice(0, 8)), listVisitors({ filter: "identified", q, pageSize: 8 })])
    : [[], [], [], { rows: [] }];
  const total = orders.length + customers.length + products.length + visitors.rows.length;

  return (
    <>
      <PageHeader title="Qidiruv" lead="Buyurtma raqami, mijoz ismi yoki telefoni, mahsulot nomi — hammasi bitta joyda." />
      <form role="search" action="/admin/search" className="mb-5 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} autoFocus placeholder="Masalan: GV-000123, Dilnoza, 90 123, omega" aria-label="Qidirish" className={`${inputClass} max-w-[520px]`} />
        <button type="submit" className={buttonClass}>Qidirish</button>
      </form>
      {q.length < 2 ? (
        <EmptyState title="Kamida 2 ta belgi kiriting" />
      ) : total === 0 ? (
        <EmptyState title={`«${q}» boʻyicha hech narsa topilmadi`} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {orders.length > 0 && (
            <Card title={`Buyurtmalar · ${orders.length}`}>
              <ul>{orders.map((o) => (
                <li key={o.id}><Link href={`/admin/orders/${o.number}`} className={rowClass}>
                  <span className="min-w-0"><span className="block font-semibold">{o.number} · {o.customer.name}</span><span className="block text-[13px] text-muted">{o.customer.phone} · {formatDateTime(o.createdAt)}</span></span>
                  <span className="flex shrink-0 items-center gap-2"><Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill><b className="tabular-nums">{som(o.total)}</b></span>
                </Link></li>
              ))}</ul>
            </Card>
          )}
          {customers.length > 0 && (
            <Card title={`Mijozlar · ${customers.length}`}>
              <ul>{customers.map((c) => (
                <li key={c.phone9}><Link href={`/admin/customers/${c.phone9}`} className={rowClass}>
                  <span className="min-w-0"><span className="block font-semibold">{c.name}</span><span className="block text-[13px] text-muted">{c.phone} · {c.successfulOrderCount} ta buyurtma</span></span>
                  <b className="shrink-0 tabular-nums">{som(c.lifetimeValue)}</b>
                </Link></li>
              ))}</ul>
            </Card>
          )}
          {products.length > 0 && (
            <Card title={`Mahsulotlar · ${products.length}`}>
              <ul>{products.map((p) => (
                <li key={p.id}><Link href={`/admin/products/${encodeURIComponent(p.id)}`} className={rowClass}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-tile">{(p.cutout ?? p.images[0]) && <Image src={(p.cutout ?? p.images[0])!} alt="" fill sizes="44px" className="object-contain p-1" />}</span>
                    <span className="truncate font-semibold">{p.name || p.slug}</span>
                  </span>
                  <b className="shrink-0 tabular-nums">{som(p.price)}</b>
                </Link></li>
              ))}</ul>
            </Card>
          )}
          {visitors.rows.length > 0 && (
            <Card title={`Tashrif buyuruvchilar · ${visitors.rows.length}`}>
              <ul>{visitors.rows.map((v) => (
                <li key={v.id}><Link href={`/admin/visitors/${v.id}`} className={rowClass}>
                  <span className="min-w-0"><span className="block font-semibold">{v.name ?? `+998 ${v.phone9}`}</span><span className="block text-[13px] text-muted">{v.channel} · {v.sessions} tashrif</span></span>
                  <span className="shrink-0 text-[13px] text-muted">{timeAgo(v.lastSeenAt)}</span>
                </Link></li>
              ))}</ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
