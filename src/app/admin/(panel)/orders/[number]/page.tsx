import { notFound } from "next/navigation";
import { getOrder } from "@/lib/admin/queries";
import { ORDER_STATUSES } from "@/lib/db/schema";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { updateOrder } from "@/app/admin/_actions/orders";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, PageHeader, inputClass, textareaClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { describeAttribution } from "@/lib/analytics/attribution";

export const metadata = { title: "Buyurtma" };

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
      <dt className="w-[160px] shrink-0 text-sm text-muted">{label}</dt>
      <dd className="text-[15px]">{value}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const o = await getOrder(number);
  if (!o) notFound();

  return (
    <>
      <PageHeader title={`Buyurtma ${o.number}`} lead={`${formatDateTime(o.createdAt)} · ${STATUS_LABEL[o.status]}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <Card title="Mahsulotlar">
            <ul className="divide-y divide-line">
              {o.items.map((it) => (
                <li key={`${it.productId}-${it.upsellDiscountPercent ?? 0}`} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[15px]">
                    <a href={`/uz/product/${it.slug}`} target="_blank" rel="noopener" className="font-semibold hover:underline">{it.name}</a>
                    <span className="text-muted"> × {it.quantity}</span>
                    {it.subscription && <span className="text-muted"> · obuna har {it.subscription.intervalDays} kunda</span>}
                    {it.upsellDiscountPercent ? <span className="text-muted"> · taklif −{it.upsellDiscountPercent}%</span> : null}
                  </span>
                  <span className="shrink-0 font-semibold">{formatNumber(it.unitPrice * it.quantity)} soʻm</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 border-t border-line pt-3 text-[15px]">
              <div className="flex justify-between py-1"><dt>Mahsulotlar</dt><dd>{formatNumber(o.totals.subtotal)} soʻm</dd></div>
              {o.totals.discount > 0 && <div className="flex justify-between py-1"><dt>Chegirma</dt><dd>−{formatNumber(o.totals.discount)} soʻm</dd></div>}
              <div className="flex justify-between py-1"><dt>Yetkazish</dt><dd>{o.totals.shipping ? `${formatNumber(o.totals.shipping)} soʻm` : "bepul"}</dd></div>
              <div className="flex justify-between py-1 text-lg font-bold"><dt>Jami</dt><dd>{formatNumber(o.total)} soʻm</dd></div>
            </dl>
          </Card>
          <Card title="Mijoz va yetkazish">
            <dl className="divide-y divide-line">
              <Row label="Ism" value={o.customer.name} />
              <Row label="Telefon" value={o.customer.phone} />
              <Row label="Email" value={o.customer.email} />
              <Row label="Viloyat" value={o.delivery.region} />
              <Row label="Manzil" value={o.delivery.address} />
              <Row label="Usul" value={o.delivery.method} />
              <Row label="Izoh" value={o.delivery.note} />
              <Row label="Toʻlov" value={o.payment ? `${o.payment.method}${o.payment.provider ? ` · ${o.payment.provider}` : ""}` : null} />
              <Row label="Til" value={o.locale} />
              <Row label="Manba" value={describeAttribution(o.attribution ?? undefined) || null} />
              <Row label="Kirish sahifasi" value={o.attribution?.landing} />
            </dl>
          </Card>
        </div>
        <Card title="Holat">
          <ActionForm action={updateOrder} className="flex flex-col gap-4">
            <input type="hidden" name="number" value={o.number ?? ""} />
            <Field label="Holat">
              <select name="status" defaultValue={o.status} className={inputClass}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="Ichki izoh" hint="Mijozga koʻrinmaydi">
              <textarea name="adminNote" defaultValue={o.adminNote ?? ""} rows={4} className={textareaClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
