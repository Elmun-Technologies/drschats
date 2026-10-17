import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { botOrderEvents } from "@/lib/db/schema";
import { customerLifecycle, getCustomerDetails, listCustomerNotes } from "@/lib/admin/customers";
import { recentEventsForPhone, visitorsForPhone } from "@/lib/admin/crm";
import { daysSince, STAGE_LABEL } from "@/lib/journey/model";
import { addCustomerNote } from "@/app/admin/_actions/crm";
import { ActionForm } from "@/components/admin/ActionForm";
import { Timeline } from "@/components/admin/Timeline";
import { CustomerLoyalty } from "@/components/admin/loyalty/CustomerLoyalty";
import { Card, Field, Metric, PageHeader, Pill, buttonClass, linkClass, secondaryButtonClass, som, textareaClass, timeAgo } from "@/components/admin/ui";
import { STATUS_LABEL, STATUS_TONE, formatDate, formatDateTime } from "@/lib/admin/order-labels";
import { DEVICE_LABEL } from "@/lib/admin/event-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { lineTotal } from "@/lib/cart/pricing";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Mijoz profili" };

const LIFECYCLE_LABEL = { new: "Yangi mijoz", repeat: "Qayta xarid qilgan", vip: "VIP mijoz", dormant: "Faolligi pasaygan" } as const;

export default async function AdminCustomerPage({ params }: { params: Promise<{ phone9: string }> }) {
  const { phone9 } = await params;
  const [customer, notes, visitors, events] = await Promise.all([getCustomerDetails(phone9), listCustomerNotes(phone9), visitorsForPhone(phone9), recentEventsForPhone(phone9)]);
  if (!customer) notFound();
  const ids = customer.orders.map((order) => order.id);
  const history = ids.length ? await getDb().select({ orderId: botOrderEvents.orderId, status: botOrderEvents.status, createdAt: botOrderEvents.createdAt }).from(botOrderEvents).where(inArray(botOrderEvents.orderId, ids)).orderBy(desc(botOrderEvents.createdAt)) : [];
  const historyByOrder = new Map<number, typeof history>();
  for (const event of history) historyByOrder.set(event.orderId, [...(historyByOrder.get(event.orderId) ?? []), event]);
  const lifecycle = customerLifecycle(customer);
  const days = daysSince(customer.lastOrderAt) ?? 0;
  const average = customer.successfulOrderCount ? Math.round(customer.lifetimeValue / customer.successfulOrderCount) : 0;
  const gaps = customer.orders.filter((o) => o.status !== "cancelled").map((o) => o.createdAt.getTime()).sort((a, b) => a - b);
  const cadence = gaps.length > 1 ? Math.round((gaps[gaps.length - 1] - gaps[0]) / (gaps.length - 1) / 86_400_000) : null;
  const firstTouch = visitors.find((v) => v.firstTouch)?.channel;

  return (
    <>
      <PageHeader
        eyebrow={LIFECYCLE_LABEL[lifecycle]}
        title={customer.name}
        lead={`${customer.phone}${customer.email ? ` · ${customer.email}` : ""}`}
        actions={<>
          <a href={`tel:${customer.phone}`} className={buttonClass}>Qoʻngʻiroq qilish</a>
          {customer.email && <a href={`mailto:${customer.email}`} className={secondaryButtonClass}>Email</a>}
          <Link href="/admin/customers" className={secondaryButtonClass}>← Roʻyxat</Link>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Buyurtmalar" value={formatNumber(customer.successfulOrderCount)} hint={customer.orderCount > customer.successfulOrderCount ? `+${customer.orderCount - customer.successfulOrderCount} bekor` : "bekor qilinganlarsiz"} />
        <Metric label="Jami xarid" value={som(customer.lifetimeValue)} />
        <Metric label="Oʻrtacha chek" value={som(average)} />
        <Metric label="Oxirgi xariddan beri" value={days === 0 ? "bugun" : `${days} kun`} hint={formatDate(customer.lastOrderAt)} />
        <Metric label="Xarid oraligʻi" value={cadence !== null ? `${cadence} kun` : "—"} hint={cadence !== null ? "oʻrtacha" : "bitta xarid"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Buyurtmalar">
            <ol className="flex flex-col gap-3">
              {customer.orders.map((order) => (
                <li key={order.id} className="rounded-[16px] border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><Link href={`/admin/orders/${order.number}`} className={linkClass}>{order.number}</Link><p className="text-[13px] text-muted">{formatDateTime(order.createdAt)}</p></div>
                    <div className="flex items-center gap-2"><Pill tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Pill><b className="tabular-nums">{som(order.total)}</b></div>
                  </div>
                  <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-[14px]">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.productId}-${item.upsellDiscountPercent ?? 0}`} className="flex justify-between gap-3">
                        <span className="min-w-0 text-ink-2">{item.name} <span className="text-muted">× {item.quantity}</span></span>
                        <span className="shrink-0 tabular-nums">{som(lineTotal({ price: item.unitPrice, quantity: item.quantity, upsellDiscountPercent: item.upsellDiscountPercent }))}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[13px] text-muted">{order.delivery.region} · {order.delivery.method}{describeAttribution(order.attribution ?? undefined) ? ` · manba: ${describeAttribution(order.attribution ?? undefined)}` : ""}</p>
                  {(historyByOrder.get(order.id)?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[...(historyByOrder.get(order.id) ?? [])].reverse().map((event, index) => <Pill key={index} tone="muted">{STATUS_LABEL[event.status]} · {formatDateTime(event.createdAt)}</Pill>)}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Saytdagi harakatlari" lead="Shu telefon bilan bogʻlangan barcha qurilmalardan">
            <Timeline events={events} />
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <CustomerLoyalty phone9={phone9} />
          <Card title="Mijoz haqida">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[14px]">
              <dt className="text-muted">Birinchi buyurtma</dt><dd className="font-semibold">{formatDate(customer.firstOrderAt)}</dd>
              <dt className="text-muted">Hudud</dt><dd className="font-semibold">{customer.orders[0]?.delivery.region || "—"}</dd>
              <dt className="text-muted">Birinchi kelgan</dt><dd className="font-semibold">{firstTouch ?? (describeAttribution(customer.orders[customer.orders.length - 1]?.attribution ?? undefined) || "Bevosita")}</dd>
            </dl>
            {visitors.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[14px]">
                {visitors.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-2">
                    <Link href={`/admin/visitors/${v.id}`} className={linkClass}>{v.device ? DEVICE_LABEL[v.device] : "Qurilma"} · {formatNumber(v.sessions)} tashrif</Link>
                    <span className="text-[13px] text-muted">{STAGE_LABEL[v.stage]} · {timeAgo(v.lastSeenAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Jamoa izohlari">
            <ActionForm action={addCustomerNote} submitLabel="Izohni saqlash" className="flex flex-col gap-3">
              <input type="hidden" name="phone9" value={customer.phone9} />
              <Field label="Ichki izoh" hint="Faqat xizmat va buyurtma boʻyicha. Sogʻliq yoki karta maʼlumotini yozmang.">
                <textarea name="note" rows={3} maxLength={2000} required placeholder="Masalan: soat 15:00 dan keyin qoʻngʻiroq qilish" className={textareaClass} />
              </Field>
            </ActionForm>
            {notes.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                {notes.map((note) => <li key={note.id} className="rounded-[12px] bg-tile p-3"><p className="whitespace-pre-wrap text-[14px] leading-5 text-ink">{note.note}</p><p className="mt-1.5 text-[12px] text-muted">{note.author ?? "Admin"} · {formatDateTime(note.createdAt)}</p></li>)}
              </ul>
            ) : <p className="mt-3 text-[14px] text-muted">Hali izoh yoʻq.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
