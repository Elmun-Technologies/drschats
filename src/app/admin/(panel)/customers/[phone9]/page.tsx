import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { botOrderEvents } from "@/lib/db/schema";
import { customerLifecycle, getCustomerDetails, listCustomerNotes } from "@/lib/admin/customers";
import { addCustomerNote } from "@/app/admin/_actions/crm";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, Field, PageHeader, Pill, buttonClass, inputClass, textareaClass } from "@/components/admin/ui";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Mijoz profili" };

function CustomerIcon({ name }: { name: "orders" | "cash" | "clock" }) {
  const paths = {
    orders: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    cash: <><path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17V6.5A2.5 2.5 0 0 1 6 4h11" /><path d="M16 12h4M7 15h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[18px] w-[18px]">{paths[name]}</svg>;
}

export default async function AdminCustomerPage({ params }: { params: Promise<{ phone9: string }> }) {
  const { phone9 } = await params;
  const [customer, notes] = await Promise.all([getCustomerDetails(phone9), listCustomerNotes(phone9)]);
  if (!customer) notFound();
  const ids = customer.orders.map((order) => order.id);
  const events = ids.length ? await getDb().select({ orderId: botOrderEvents.orderId, status: botOrderEvents.status, createdAt: botOrderEvents.createdAt }).from(botOrderEvents).where(inArray(botOrderEvents.orderId, ids)).orderBy(desc(botOrderEvents.createdAt)) : [];
  const eventsByOrder = new Map<number, typeof events>();
  for (const event of events) eventsByOrder.set(event.orderId, [...(eventsByOrder.get(event.orderId) ?? []), event]);
  const latestOrder = customer.orders[0];
  const lifecycle = customerLifecycle(customer);
  const lifecycleLabel = { new: "Yangi mijoz", repeat: "Qayta xarid qilgan", vip: "VIP mijoz", dormant: "Faolligi pasaygan" }[lifecycle];

  return (
    <>
      <div className="mb-4"><Link href="/admin/customers" className="text-[11px] font-semibold text-[#0f2d24] hover:underline">← Mijozlar roʻyxatiga qaytish</Link></div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title={customer.name} lead={`${customer.phone}${customer.email ? ` · ${customer.email}` : ""} · soʻnggi buyurtma ${formatDateTime(customer.lastOrderAt)}`} />
        <div className="mb-6 flex gap-2">
          <a href={`tel:${customer.phone}`} className={buttonClass}>Qoʻngʻiroq qilish</a>
          {customer.email && <a href={`mailto:${customer.email}`} className="inline-flex h-11 items-center justify-center rounded-sm border border-[#e4e6e8] bg-white px-4 text-[13px] font-semibold text-[#44494e] hover:bg-[#f1f3f0]">Email</a>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetricCard label="Buyurtmalar" value={formatNumber(customer.orderCount)} caption="Telefon raqami boʻyicha" icon={<CustomerIcon name="orders" />} />
        <AdminMetricCard label="Buyurtmalar summasi" value={`${formatNumber(customer.lifetimeValue)} soʻm`} caption="Bekor qilinganlar hisoblanmadi" icon={<CustomerIcon name="cash" />} />
        <AdminMetricCard label="Oʻrtacha chek" value={`${formatNumber(customer.successfulOrderCount ? Math.round(customer.lifetimeValue / customer.successfulOrderCount) : 0)} soʻm`} caption="Muvaffaqiyatli buyurtmalar boʻyicha" icon={<CustomerIcon name="cash" />} />
        <AdminMetricCard label="Birinchi buyurtma" value={formatDateTime(customer.firstOrderAt)} caption={`Oxirgisi: ${formatDateTime(customer.lastOrderAt)}`} icon={<CustomerIcon name="clock" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <Card title="Mijoz yoʻli · buyurtmalar" actions={<span className="text-[10px] text-[#63686e]">Eng soʻnggi 200 ta</span>}>
          <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[14px] before:top-4 before:w-px before:bg-[#e4e6e8]">
            {customer.orders.map((order) => {
              const history = eventsByOrder.get(order.id) ?? [];
              return (
                <li key={order.id} className="relative pl-9">
                  <span className={`absolute left-[8px] top-4 z-[1] h-3.5 w-3.5 rounded-full border-[3px] border-white ${order.status === "delivered" ? "bg-[#0f2d24]" : order.status === "cancelled" ? "bg-[#c8161d]" : "bg-[#0f2d24]"}`} />
                  <div className="rounded-sm border border-[#f1f3f0] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><Link href={`/admin/orders/${order.number}`} className="text-[12px] font-bold text-[#0f2d24] hover:underline">{order.number}</Link><p className="mt-1 text-[10px] text-[#63686e]">{formatDateTime(order.createdAt)}</p></div>
                      <Pill tone={order.status === "new" ? "dark" : order.status === "cancelled" ? "red" : "neutral"}>{STATUS_LABEL[order.status]}</Pill>
                    </div>
                    <ul className="mt-3 space-y-1.5 border-t border-[#f1f3f0] pt-3">
                      {order.items.map((item) => <li key={`${order.id}-${item.productId}`} className="flex items-start justify-between gap-3 text-[10px]"><span className="min-w-0 text-[#44494e]">{item.name} <span className="text-[#63686e]">× {item.quantity}</span></span><span className="shrink-0 font-semibold text-[#44494e]">{formatNumber(item.unitPrice * item.quantity)} soʻm</span></li>)}
                    </ul>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#63686e]"><span>{order.delivery.region} · {order.delivery.method}</span><span className="font-bold text-[#0f2d24]">Jami {formatNumber(order.total)} soʻm</span></div>
                    {describeAttribution(order.attribution ?? undefined) && <p className="mt-2 text-[10px] text-[#63686e]">Manba: {describeAttribution(order.attribution ?? undefined)}</p>}
                    {history.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#f1f3f0] pt-3">{history.slice(0, 4).reverse().map((event, index) => <span key={`${event.createdAt.toISOString()}-${index}`} className="rounded-full bg-[#f1f3f0] px-2 py-1 text-[9px] text-[#44494e]">{STATUS_LABEL[event.status]} · {formatDateTime(event.createdAt)}</span>)}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Mijoz haqida">
            <dl className="divide-y divide-[#e4e6e8] text-[11px]">
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Mijoz bosqichi</dt><dd className="text-right font-semibold text-[#0f2d24]">{lifecycleLabel}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Telefon</dt><dd className="text-right font-semibold text-[#44494e]">{customer.phone}</dd></div>
              {customer.email && <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Email</dt><dd className="text-right font-semibold text-[#44494e]">{customer.email}</dd></div>}
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Oxirgi buyurtma</dt><dd className="text-right font-semibold text-[#44494e]">{latestOrder?.number}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Yetkazib berish hududi</dt><dd className="text-right font-semibold text-[#44494e]">{latestOrder?.delivery.region || "—"}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#63686e]">Manba</dt><dd className="max-w-[190px] text-right font-semibold text-[#44494e]">{describeAttribution(latestOrder?.attribution ?? undefined) || "Bevosita / aniqlanmagan"}</dd></div>
            </dl>
            <p className="mt-3 rounded-sm bg-[#f1f3f0] p-3 text-[10px] leading-4 text-[#63686e]">Profil buyurtma maʼlumotlaridan tuzilgan. Alohida sogʻliq profili yoki kuzatuv identifikatori saqlanmaydi.</p>
          </Card>

          <Card title="Jamoa izohlari">
            <div className="mb-4">
              <ActionForm action={addCustomerNote} submitLabel="Izohni saqlash" className="flex flex-col gap-3">
                <input type="hidden" name="phone9" value={customer.phone9} />
                <Field label="Ichki izoh" hint="Faqat xizmat va buyurtma bo‘yicha yozing. Sogʻliq yoki karta maʼlumotlarini kiritmang.">
                  <textarea name="note" rows={3} maxLength={2000} required placeholder="Masalan: mijozga soat 15:00 dan keyin qoʻngʻiroq qilish…" className={textareaClass} />
                </Field>
              </ActionForm>
            </div>
            {notes.length ? <ul className="space-y-2 border-t border-[#e4e6e8] pt-3">
              {notes.map((note) => <li key={note.id} className="rounded-sm bg-[#f1f3f0] p-3"><p className="whitespace-pre-wrap text-[11px] leading-5 text-[#44494e]">{note.note}</p><p className="mt-2 text-[9px] text-[#63686e]">{note.author ?? "Admin"} · {formatDateTime(note.createdAt)}</p></li>)}
            </ul> : <p className="text-[10px] text-[#63686e]">Hali ichki izoh yoʻq.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
