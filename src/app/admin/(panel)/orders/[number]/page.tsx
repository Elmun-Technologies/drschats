import Image from "next/image";
import { regionName } from "@/lib/checkout/regions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { getOrder } from "@/lib/admin/queries";
import { botOrderEvents, ORDER_STATUSES, products } from "@/lib/db/schema";
import { DELIVERY_LABEL, LOCALE_LABEL, NEXT_STATUS, PAYMENT_LABEL, PAYMENT_STATE_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { setOrderStatus, updateOrder } from "@/app/admin/_actions/orders";
import { ActionForm } from "@/components/admin/ActionForm";
import { CopyButton } from "@/components/admin/CopyButton";
import { Card, Field, PageHeader, Pill, buttonClass, inputClass, secondaryButtonClass, smallButtonClass, som, textareaClass, timeAgo } from "@/components/admin/ui";
import { describeAttribution } from "@/lib/analytics/attribution";
import { lineTotal } from "@/lib/cart/pricing";
import { discountAdjustment, pointsSpent } from "@/lib/promo/rules";
import { requireAdmin } from "@/lib/admin/session";
import { paymentsOfOrder } from "@/lib/payments/store";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Buyurtma");

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const { number } = await params;
  const o = await getOrder(number);
  if (!o) notFound();
  const db = getDb();
  const slugs = [...new Set(o.items.map((i) => i.slug))];
  const [history, pics, payments] = await Promise.all([
    db.select().from(botOrderEvents).where(eq(botOrderEvents.orderId, o.id)).orderBy(desc(botOrderEvents.createdAt)),
    slugs.length ? db.select({ slug: products.slug, id: products.id, cutout: products.cutout, images: products.images }).from(products).where(inArray(products.slug, slugs)) : Promise.resolve([]),
    paymentsOfOrder(o.number!).catch(() => []),
  ]);
  const picOf = new Map(pics.map((p) => [p.slug, { id: p.id, src: p.cutout ?? p.images[0] ?? null }]));
  const phoneDigits = o.customer.phone.replace(/\D/g, "");
  const phone9 = phoneDigits.slice(-9);
  const next = NEXT_STATUS[o.status];
  const changes = history.filter((event) => event.status !== "new").reverse();
  const address = [regionName(o.delivery.region), o.delivery.address].filter(Boolean).join(", ");
  const units = o.items.reduce((sum, item) => sum + item.quantity, 0);
  // The order-level discount (promo code or first order) is part of totals.discount; shown as its own line.
  const adjustment = discountAdjustment(o.totals.adjustments);
  const points = pointsSpent(o.totals.adjustments);
  const adjusted = adjustment?.amount ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={`${formatDateTime(o.createdAt)} · ${timeAgo(o.createdAt)}`}
        title={`Buyurtma ${o.number}`}
        lead={<span className="inline-flex items-center gap-2"><Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill>{o.paymentStatus !== "unpaid" && <Pill tone={o.paymentStatus === "paid" ? "dark" : "outline"}>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</Pill>}{!o.operatorNotifiedAt && <Pill tone="outline">{t("Telegram xabari yetib bormagan")}</Pill>}<span className="text-ink-2">{units} {t("dona ·")} {som(o.total)}</span></span>}
        actions={<>
          <a href={`/admin/print/orders/${o.number}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>{t("Yuk varagʻi")}</a>
          <Link href="/admin/orders" className={secondaryButtonClass}>{t("← Buyurtmalar")}</Link>
        </>}
      />

      {o.status !== "delivered" && o.status !== "cancelled" && (
        <section aria-label={t("Tezkor amallar")} className="mb-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-tile p-4">
          <span className="mr-2 text-[15px] font-semibold text-ink">{t("Keyingi qadam:")}</span>
          {next && (
            <form action={setOrderStatus}>
              <input type="hidden" name="number" value={o.number ?? ""} />
              <input type="hidden" name="status" value={next.status} />
              <button type="submit" className={buttonClass}>{t(next.label)}</button>
            </form>
          )}
          <a href={`tel:+${phoneDigits.length === 9 ? `998${phoneDigits}` : phoneDigits}`} className={secondaryButtonClass.replace("bg-tile", "bg-white")}>{t("Qoʻngʻiroq qilish")}</a>
          <form action={setOrderStatus} className="ml-auto">
            <input type="hidden" name="number" value={o.number ?? ""} />
            <input type="hidden" name="status" value="cancelled" />
            <button type="submit" className="inline-flex h-12 items-center rounded-[12px] px-4 text-[15px] font-semibold text-red hover:bg-white">{t("Bekor qilish")}</button>
          </form>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title={t("Mahsulotlar")}>
            <ul className="divide-y divide-line">
              {o.items.map((it) => {
                const pic = picOf.get(it.slug);
                return (
                  <li key={`${it.productId}-${it.upsellDiscountPercent ?? 0}-${it.subscription?.intervalDays ?? 0}`} className="flex items-center gap-4 py-3">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-tile">
                      {pic?.src && <Image src={pic.src} alt="" fill sizes="56px" className="object-contain p-1" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      {pic ? <Link href={`/admin/products/${encodeURIComponent(pic.id)}`} className="block truncate text-[15px] font-semibold text-ink hover:underline">{it.name}</Link> : <span className="block truncate text-[15px] font-semibold">{it.name}</span>}
                      <span className="mt-0.5 flex flex-wrap gap-1.5 text-[13px] text-muted">
                        {som(it.unitPrice)} × {it.quantity}
                        {it.upsellDiscountPercent ? <Pill tone="red">{t("taklif −")}{it.upsellDiscountPercent}%</Pill> : null}
                        {it.subscription ? <Pill tone="outline">{t("obuna · har")} {it.subscription.intervalDays} kun</Pill> : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold tabular-nums">{som(lineTotal({ price: it.unitPrice, quantity: it.quantity, upsellDiscountPercent: it.upsellDiscountPercent }))}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-4 text-[15px]">
              <div className="flex justify-between"><dt className="text-ink-2">{t("Mahsulotlar")}</dt><dd className="tabular-nums">{som(o.totals.subtotal)}</dd></div>
              {o.totals.discount - adjusted > 0 && <div className="flex justify-between"><dt className="text-ink-2">{adjustment ? t("Taklif va aksiyalar") : t("Chegirma")}</dt><dd className="tabular-nums">−{som(o.totals.discount - adjusted)}</dd></div>}
              {adjustment && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">
                    {adjustment.kind === "promo" ? (
                      <>{t("Promokod")} <Link href={`/admin/promocodes/${encodeURIComponent(adjustment.code)}`} className="font-semibold text-ink underline-offset-4 hover:underline">{adjustment.code}</Link></>
                    ) : adjustment.kind === "referral" ? (
                      <>{t("Doʻst kodi")} <Link href="/admin/loyalty#referral" className="font-semibold text-ink underline-offset-4 hover:underline">{adjustment.code}</Link> −{adjustment.percent}%</>
                    ) : (
                      `Birinchi buyurtma −${adjustment.percent}%`
                    )}
                  </dt>
                  <dd className="tabular-nums">−{som(adjustment.amount)}</dd>
                </div>
              )}
              {points > 0 && <div className="flex justify-between"><dt className="text-ink-2">{t("Ball bilan toʻlandi")}</dt><dd className="tabular-nums">−{som(points)}</dd></div>}
              <div className="flex justify-between"><dt className="text-ink-2">{t("Yetkazish")}</dt><dd className="tabular-nums">{o.totals.shipping ? som(o.totals.shipping) : "bepul"}</dd></div>
              <div className="mt-1 flex justify-between text-[18px] font-bold"><dt>{t("Jami")}</dt><dd className="tabular-nums">{som(o.total)}</dd></div>
            </dl>
          </Card>

          <Card title={t("Mijoz va yetkazish")} actions={phone9.length === 9 ? <Link href={`/admin/customers/${phone9}`} className={smallButtonClass}>{t("Mijoz profili")}</Link> : null}>
            <dl className="divide-y divide-line">
              <Row label={t("Ism")}>{o.customer.name}</Row>
              <Row label={t("Telefon")}><a href={`tel:+${phoneDigits.length === 9 ? `998${phoneDigits}` : phoneDigits}`} className="font-semibold underline-offset-4 hover:underline">{o.customer.phone}</a></Row>
              <Row label={t("Email")}>{o.customer.email}</Row>
              <Row label={t("Usul")}>{DELIVERY_LABEL[o.delivery.method] ?? o.delivery.method}</Row>
              <Row label={t("Manzil")}>{address ? <span className="flex flex-wrap items-center gap-2"><span>{address}</span><CopyButton text={address} /></span> : null}</Row>
              <Row label={t("Izoh")}>{o.delivery.note}</Row>
              <Row label={t("Toʻlov")}>{o.payment ? `${PAYMENT_LABEL[o.payment.method] ?? o.payment.method}${o.payment.provider ? ` · ${o.payment.provider}` : ""}` : PAYMENT_LABEL.cod}</Row>
              {(o.paymentStatus !== "unpaid" || payments.length > 0) && (
                <Row label={t("Toʻlov holati")}>
                  <span className="flex flex-col gap-1">
                    <span className="font-semibold">{PAYMENT_STATUS_LABEL[o.paymentStatus]}{o.paidAt ? ` · ${formatDateTime(o.paidAt)}` : ""}</span>
                    {payments.map((p) => (
                      <span key={p.id} className="text-[13px] text-muted">
                        {p.provider === "payme" ? "Payme" : "Click"} #{p.providerTxId.slice(-10)} · {som(p.amount / 100)} · {PAYMENT_STATE_LABEL[p.state]}
                      </span>
                    ))}
                  </span>
                </Row>
              )}
              <Row label={t("Til")}>{LOCALE_LABEL[o.locale] ?? o.locale}</Row>
              <Row label={t("Kanal")}>
                {o.source === "telegram_bot" ? t("Telegram bot — rasmiy doʻkon") : o.source === "telegram_mini" ? "Telegram Mini App" : t("Sayt")}
              </Row>
              <Row label={t("Telegram")}>{o.telegramChatId ? t("Holat botda xabar qilinadi") : null}</Row>
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title={t("Qayerdan keldi")} actions={o.visitorId ? <Link href={`/admin/visitors/${o.visitorId}`} className={smallButtonClass}>{t("Saytdagi yoʻli")}</Link> : null}>
            <dl className="divide-y divide-line">
              <Row label={t("Manba")}>{describeAttribution(o.attribution ?? undefined) || t("Bevosita")}</Row>
              <Row label={t("Kirish sahifasi")}>{o.attribution?.landing}</Row>
              <Row label={t("Havola")}>{o.attribution?.referrer}</Row>
            </dl>
          </Card>
          <Card title={t("Holat va izoh")}>
            <ActionForm action={updateOrder} className="flex flex-col gap-4">
              <input type="hidden" name="number" value={o.number ?? ""} />
              <Field label={t("Holat")}>
                <select name="status" defaultValue={o.status} className={inputClass}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </Field>
              <Field label={t("Ichki izoh")} hint={t("Mijozga koʻrinmaydi")}>
                <textarea name="adminNote" defaultValue={o.adminNote ?? ""} rows={3} className={textareaClass} />
              </Field>
            </ActionForm>
            <h3 className="mb-3 mt-5 border-t border-line pt-4 text-[15px] font-bold text-ink">{t("Holat tarixi")}</h3>
            <ol className="relative flex flex-col gap-3 border-l border-line pl-5">
              <li className="relative"><span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-4 ring-white" /><p className="text-[14px] font-semibold">{t("Buyurtma yaratildi")}</p><p className="text-[13px] text-muted">{formatDateTime(o.createdAt)}</p></li>
              {changes.map((event) => (
                <li key={event.id} className="relative"><span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${event.status === "cancelled" ? "bg-line-strong" : "bg-ink"}`} /><p className="text-[14px] font-semibold">{STATUS_LABEL[event.status]}</p><p className="text-[13px] text-muted">{formatDateTime(event.createdAt)}</p></li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
