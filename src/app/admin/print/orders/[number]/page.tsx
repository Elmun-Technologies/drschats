import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { getOrder } from "@/lib/admin/queries";
import { DELIVERY_LABEL, PAYMENT_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { lineTotal } from "@/lib/cart/pricing";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/layout/Logo";
import { PrintButton } from "@/components/admin/PrintButton";
import { som } from "@/components/admin/ui";

export const metadata = { title: "Yuk varagʻi" };

/* A packing slip for the courier: what to bring, to whom, and how much to collect. */
export default async function PrintOrderPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const { number } = await params;
  const o = await getOrder(number);
  if (!o) notFound();
  const cash = !o.payment || o.payment.method === "cod";
  return (
    <main className="mx-auto max-w-[760px] bg-white px-6 py-8 text-ink print:p-0">
      <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
        <p className="text-[14px] text-muted">A4 qogʻozda chop eting va buyurtma bilan birga bering.</p>
        <PrintButton />
      </div>
      <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-4">
        <div>
          <Logo className="text-[30px]" />
          <p className="mt-1 text-[13px] text-ink-2">{BRAND.contact.phone} · govita.uz</p>
        </div>
        <div className="text-right">
          <p className="text-[24px] font-bold">{o.number}</p>
          <p className="text-[13px] text-ink-2">{formatDateTime(o.createdAt)}</p>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-6 border-b border-line py-4 text-[14px]">
        <div>
          <p className="text-[12px] font-semibold text-muted">Qabul qiluvchi</p>
          <p className="mt-1 text-[16px] font-bold">{o.customer.name}</p>
          <p className="text-[16px] font-semibold">{o.customer.phone}</p>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-muted">{DELIVERY_LABEL[o.delivery.method] ?? o.delivery.method}</p>
          <p className="mt-1 font-semibold">{o.delivery.region}</p>
          <p>{o.delivery.address}</p>
          {o.delivery.note && <p className="mt-1 text-ink-2">Izoh: {o.delivery.note}</p>}
        </div>
      </section>
      <table className="mt-4 w-full border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-ink text-left"><th className="py-2">Mahsulot</th><th className="py-2 text-right">Soni</th><th className="py-2 text-right">Summa</th><th className="w-10 py-2 text-center">✓</th></tr>
        </thead>
        <tbody>
          {o.items.map((it) => (
            <tr key={`${it.productId}-${it.upsellDiscountPercent ?? 0}`} className="border-b border-line">
              <td className="py-2">{it.name}{it.subscription ? " (obuna)" : ""}</td>
              <td className="py-2 text-right tabular-nums">{it.quantity}</td>
              <td className="py-2 text-right tabular-nums">{som(lineTotal({ price: it.unitPrice, quantity: it.quantity, upsellDiscountPercent: it.upsellDiscountPercent }))}</td>
              <td className="py-2 text-center"><span className="inline-block h-4 w-4 border border-ink" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto mt-4 w-[300px] text-[14px]">
        <div className="flex justify-between py-0.5"><dt>Mahsulotlar</dt><dd className="tabular-nums">{som(o.totals.subtotal)}</dd></div>
        {o.totals.discount > 0 && <div className="flex justify-between py-0.5"><dt>Chegirma{o.totals.adjustments?.[0]?.kind === "promo" ? ` (promokod ${o.totals.adjustments[0].code})` : o.totals.adjustments?.[0]?.kind === "referral" ? ` (doʻst kodi ${o.totals.adjustments[0].code})` : o.totals.adjustments?.[0]?.kind === "first_order" ? " (birinchi buyurtma bilan)" : ""}</dt><dd className="tabular-nums">−{som(o.totals.discount)}</dd></div>}
        {(o.totals.adjustments?.find((a) => a.kind === "points")?.amount ?? 0) > 0 && (
          <div className="flex justify-between py-0.5"><dt>Ball bilan toʻlangan</dt><dd className="tabular-nums">−{som(o.totals.adjustments!.find((a) => a.kind === "points")!.amount)}</dd></div>
        )}
        <div className="flex justify-between py-0.5"><dt>Yetkazish</dt><dd className="tabular-nums">{o.totals.shipping ? som(o.totals.shipping) : "bepul"}</dd></div>
        <div className="mt-1 flex justify-between border-t-2 border-ink pt-2 text-[18px] font-bold"><dt>{cash ? "Olinadigan summa" : "Jami"}</dt><dd className="tabular-nums">{som(o.total)}</dd></div>
        <p className="mt-1 text-right text-[12px] text-ink-2">{o.payment ? PAYMENT_LABEL[o.payment.method] ?? o.payment.method : PAYMENT_LABEL.cod}</p>
      </dl>
      <footer className="mt-10 grid grid-cols-2 gap-10 text-[13px] text-ink-2">
        <div className="border-t border-ink pt-2">Kuryer imzosi</div>
        <div className="border-t border-ink pt-2">Qabul qildim (mijoz imzosi)</div>
      </footer>
      <p className="mt-6 text-[11px] text-muted">Biologik faol qoʻshimcha. Dori vositasi emas.</p>
    </main>
  );
}
