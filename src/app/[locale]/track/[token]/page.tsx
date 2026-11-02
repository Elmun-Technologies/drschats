import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { verifyOrderTrackToken } from "@/lib/messaging/tokens";
import { trackedOrder } from "@/lib/orders/track";
import { ORDER_STEPS, orderStepIndex } from "@/lib/account/orders";
import { shopflow } from "@/lib/shopflow";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { BRAND } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { ONLINE_PROVIDER_LABELS, isOnlineProviderId } from "@/lib/config/payments";
import { paymentUrl } from "@/lib/payments/links";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "track" });
  // A personal page reached by a signed link: never indexed, never passed on as a referrer.
  return { title: t("title"), robots: { index: false, follow: false }, referrer: "no-referrer" };
}

/*
  One order, opened by its signed link (lib/messaging/tokens.ts). Design:
  OrderDetailV3 — status timeline, lines, totals — without the account shell,
  and without anything personal: no name, phone or address.
*/
export default async function TrackedOrderPage({ params }: { params: Promise<{ locale: Locale; token: string }> }) {
  const { locale, token } = await params;
  const number = verifyOrderTrackToken(decodeURIComponent(token));
  if (!number) notFound();
  const order = await trackedOrder(number).catch(() => null);
  if (!order) notFound();
  setRequestLocale(locale);

  const [t, tv, ts, tc] = await Promise.all([
    getTranslations("track"),
    getTranslations("account.v3"),
    getTranslations("account.status"),
    getTranslations("contact"),
  ]);
  const products = await Promise.all(order.items.map((i) => shopflow.getProduct(i.slug, locale).catch(() => null)));
  const step = orderStepIndex(order.status);
  const cancelled = order.status === "cancelled";
  const known = KNOWN.has(order.status) ? (order.status as (typeof ORDER_STEPS)[number] | "cancelled") : null;
  const hint = known ? t(`hint.${known}`, { hours: tc("workHours") }) : null;
  /*
    Payment: the gateways bring the customer back here. Paid and refunded are
    the gateway's word (its callback set them); an online order still waiting
    gets its "pay" link again, built from the saved total.
  */
  const provider = isOnlineProviderId(order.provider) ? order.provider : null;
  const providerLabel = provider ? ONLINE_PROVIDER_LABELS[provider] : "";
  const awaitingPayment = order.payment === "online" && provider && !cancelled && (order.paymentStatus === "pending" || order.paymentStatus === "unpaid");
  const payLink = awaitingPayment && provider ? await paymentUrl(provider, { number: order.number, total: order.total, locale: order.locale }).catch(() => null) : null;
  const paymentLine =
    order.paymentStatus === "paid"
      ? t("paid", { provider: providerLabel || t("payOnline") })
      : order.paymentStatus === "refunded"
        ? t("refunded")
        : awaitingPayment
          ? t("payPending")
          : order.payment === "online"
            ? t("payOnline")
            : t("payCod");

  return (
    <div className="wrap flex max-w-[1080px] flex-col gap-5 pb-12 pt-6 lg:gap-7 lg:pb-20 lg:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{tv("orderNo", { id: order.number })}</h1>
          <span className="text-base text-ink-2">
            {t("placed", { date: formatDate(order.createdAt, locale) })}
            {order.updatedAt !== order.createdAt && ` · ${t("updated", { date: formatDate(order.updatedAt, locale) })}`}
          </span>
        </div>
        <span className={cn("inline-flex h-9 items-center rounded-full px-4 text-[15px] font-semibold", cancelled ? "bg-tile text-ink-2" : "bg-ink text-white")}>
          {known ? ts(known) : order.status}
        </span>
      </div>

      {hint && <p className="rounded-[16px] bg-tile px-5 py-4 text-base leading-6 text-ink">{hint}</p>}

      {step >= 0 && (
        <ol className="grid grid-cols-4 gap-1 rounded-[20px] border border-line p-4 lg:px-8 lg:py-7">
          {ORDER_STEPS.map((s, i) => {
            const done = i < step || (i === step && s === "delivered");
            return (
              <li key={s} aria-current={i === step ? "step" : undefined} className="relative flex flex-col gap-2 lg:gap-2.5">
                {i < ORDER_STEPS.length - 1 && (
                  <span aria-hidden className={cn("absolute left-[18px] right-[-4px] top-[16px] h-[3px] lg:top-[17px]", i < step ? "bg-ink" : "bg-chip-strong")} />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-[1] flex h-9 w-9 items-center justify-center rounded-full",
                    done ? "bg-ink text-white" : i === step ? "border-[3px] border-ink bg-bg" : "bg-chip-strong",
                  )}
                >
                  {done && (
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </span>
                <span className={cn("text-[13px] leading-4 lg:text-base lg:leading-5", i <= step ? "font-bold" : "text-muted")}>{ts(s)}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="rounded-[20px] border border-line px-4 py-1 lg:px-7 lg:py-2">
          {order.items.map((line, i) => {
            const product = products[i];
            const image = product ? (cutoutOf(product) ?? product.images[0]?.url) : undefined;
            return (
              <li key={`${line.slug}-${i}`} className={cn("flex items-center gap-4 py-4 lg:py-[18px]", i < order.items.length - 1 && "border-b border-line")}>
                <span className="relative h-16 w-16 shrink-0 rounded-[16px] bg-tile lg:h-[84px] lg:w-[84px]">
                  {image && <Image src={image} alt="" fill sizes="84px" className="object-contain p-2" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  {product ? (
                    <Link href={`/product/${line.slug}`} className="text-[15px] font-medium hover:underline lg:text-base">{line.name}</Link>
                  ) : (
                    <span className="text-[15px] font-medium lg:text-base">{line.name}</span>
                  )}
                  <span className="text-sm text-muted">× {line.quantity}</span>
                </span>
                <span className="whitespace-nowrap text-base font-bold lg:text-lg">{formatMoney(line.total, locale)}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-tile p-5 text-[15px] lg:p-6">
          <span className="flex justify-between gap-3">
            <span className="text-ink-2">{tv("itemsSum")}</span>
            <span>{formatMoney(order.subtotal, locale)}</span>
          </span>
          {order.discount > 0 && (
            <span className="flex justify-between gap-3">
              <span className="text-ink-2">{t("discount")}</span>
              <span>−{formatMoney(order.discount, locale)}</span>
            </span>
          )}
          <span className="flex justify-between gap-3">
            <span className="text-ink-2">{order.method === "pickup" ? t("pickup") : t("shipping")}</span>
            <span>{order.shipping > 0 ? formatMoney(order.shipping, locale) : t("free")}</span>
          </span>
          <span className="flex justify-between gap-3 border-t border-line-strong pt-2.5 text-[22px] font-bold">
            <span>{tv("total")}</span>
            <span>{formatMoney(order.total, locale)}</span>
          </span>
          <span className={cn("text-sm", order.paymentStatus === "paid" ? "font-semibold text-ink" : "text-ink-2")}>{paymentLine}</span>
          {awaitingPayment && (
            <>
              {payLink && (
                <a href={payLink} className={cn(buttonVariants("primary"), "mt-1 w-full")}>
                  {t("payNow", { provider: providerLabel })}
                </a>
              )}
              <span className="text-[13px] leading-[18px] text-muted">{t("payPendingHint")}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("primary")}>
          {tv("telegram")}
        </a>
        <a href={`tel:${BRAND.contact.phoneHref}`} className={buttonVariants("secondary")}>
          {BRAND.contact.phone}
        </a>
        <Link href="/guarantee" className={buttonVariants("secondary")}>{tv("returns")}</Link>
        <Link href="/track" className={cn(buttonVariants("ghost"), "bg-transparent")}>{t("another")}</Link>
      </div>
    </div>
  );
}

const KNOWN = new Set<string>([...ORDER_STEPS, "cancelled"]);
