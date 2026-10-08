"use client";

import { cloneElement, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { REGION_KEYS } from "@/lib/checkout/regions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { OrderRequest, Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals } from "@/lib/cart/pricing";
import { COMMERCE } from "@/lib/config/commerce";
import { BRAND } from "@/lib/brand";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { inputClass } from "@/components/ui/Field";
import { ProductCard } from "@/components/product/ProductCard";
import { productCutout } from "@/lib/content/product-cutouts";
import { CartLines } from "@/components/cart/CartLines";
import { submitOrder } from "@/app/[locale]/checkout/actions";
import { getAttribution, itemOf, trackBeginCheckout, trackOrder, trackViewCart } from "@/lib/analytics/events";
import { trackPurchase } from "@/lib/personalization/tracker";
import { buildUpsellLadder } from "@/lib/upsell/ladder";
import { gapFillers } from "@/lib/cart/gap";
import { FreeShippingFillers } from "@/components/cart/FreeShippingFillers";
import { UpsellSavingsBar } from "@/components/upsell/UpsellSavingsBar";
import { ONLINE_PAYMENT_MARKS, PAYMENT_PROVIDERS, onlinePaymentAvailable } from "@/lib/config/payments";
import { PaymentMark, PaymentMarks } from "@/components/ui/PaymentMarks";

/*
  Regions are keyed, not hardcoded strings.

  They used to be a flat Uzbek array, so a Russian-speaking customer met a
  bilingual site that switched to Uzbek at the one field they cannot skip. The
  key is what travels to the backend, so an order stays readable whichever
  language it was placed in.
*/

/*
  Design: CartV3 / CartMobileV3 — the cart and the order form on one page.
  The schema, the payload and the server action are the ones /checkout used;
  only the layout changed. The whole page is one <form>, so the summary's
  "Buyurtmani yuborish" and the phone's fixed bar both submit it.
*/
export function CheckoutForm({
  recommended,
  prices,
}: {
  recommended: Product[];
  prices: Record<string, { price: number; oldPrice?: number; inStock: boolean }>;
}) {
  const tv = useTranslations("cart.v3");
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const te = useTranslations("checkout.errors");
  const tr = useTranslations("checkout.regions");
  const tc = useTranslations("cart");
  const ts = useTranslations("subscription");
  const tp = useTranslations("product.v3");
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const removeLine = useCart((s) => s.remove);
  const promotions = usePromotions();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const syncPrices = useCart((s) => s.syncPrices);
  useEffect(() => {
    if (mounted) syncPrices(prices);
  }, [mounted, prices, syncPrices]);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const analyticsItems = () => linesRef.current.map((l) => itemOf(l, l.quantity, l.upsellDiscountPercent));
  useEffect(() => {
    if (mounted && linesRef.current.length > 0) trackViewCart(analyticsItems());
  }, [mounted]);
  // begin_checkout: the first time the customer starts filling the order form.
  const checkoutStarted = useRef(false);

  const schema = z.object({
    name: z.string().min(2, t("errorRequired")),
    phone: z.string().min(7, t("errorPhone")),
    // Optional: the phone is what an operator calls, and demanding an address
    // as well would cost more orders than the confirmation email is worth.
    email: z.union([z.string().email(t("errorEmail")), z.literal("")]).optional(),
    region: z.string().min(1, t("errorRequired")),
    address: z.string().min(3, t("errorRequired")),
    note: z.string().optional(),
    method: z.enum(["courier", "pickup"]),
    payment: z.enum(["online", "cod"]),
    /** Which provider's page will take the money, when paying online. */
    provider: z.enum(["payme", "click", "uzum"]).optional(),
    subscribe: z.boolean().optional(),
  }).refine(
    /*
      Online payment without a provider is an order nobody can pay. The check
      lives here as well as in the UI because the UI can be bypassed by an
      autofill or a stale tab, and an unpaid "online" order would sit in the
      operator queue looking paid.
    */
    (values) => values.payment !== "online" || Boolean(values.provider),
    { path: ["provider"], message: t("errorRequired") },
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      method: "courier",
      payment: onlinePaymentAvailable() ? "online" : "cod",
      provider: onlinePaymentAvailable() ? PAYMENT_PROVIDERS.find((p) => p.configured)?.id : undefined,
      subscribe: false,
    },
  });


  const emailEntered = Boolean(watch("email"));
  const provider = watch("provider");
  const payment = watch("payment");

  if (!mounted) return <div className="min-h-[60vh]" />;
  if (lines.length === 0) return <EmptyCart recommended={recommended} />;

  // Paid steps only. The cart shows the steps side by side, so the free last
  // step would be free for nothing; it is earned in the step-by-step modal.
  // Each ladder percent once: after an accept the ladder is rebuilt, and
  // without this it would offer a fresh product at the same discount forever.
  const takenPercents = new Set(lines.map((l) => l.upsellDiscountPercent).filter(Boolean));
  const ladderSteps = buildUpsellLadder(lines, recommended).filter(
    (s) => s.stepType !== "free_gift" && !takenPercents.has(s.discountPercent),
  );
  const payChoice = payment === "online" ? provider : "cod";
  const choosePay = (value: string) => {
    if (value === "cod") {
      setValue("payment", "cod");
      setValue("provider", undefined);
    } else {
      setValue("payment", "online");
      setValue("provider", value as "payme" | "click" | "uzum", { shouldValidate: Boolean(errors.provider) });
    }
  };
  const totals = computeTotals(lines, promotions, { pickup: watch("method") === "pickup" });
  const savings =
    lines.reduce((acc, l) => acc + ((l.oldPrice ?? l.price) - l.price) * l.quantity, 0) + totals.discount;
  const progress = totals.freeShippingThreshold
    ? Math.min(100, Math.round(((totals.subtotal - totals.discount) / totals.freeShippingThreshold) * 100))
    : 0;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setServerError(null);
    const payload: OrderRequest = {
      customer: {
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        // Ticking the box on the order form is a marketing opt-in like any
        // other, so it starts the same confirmation flow rather than adding
        // the address to a list behind the customer's back.
        marketingOptIn: Boolean(values.email && values.subscribe),
      },
      payment:
        values.payment === "online" && provider
          ? { method: "online" as const, provider }
          : { method: "cod" as const },
      delivery: {
        region: values.region,
        address: values.address,
        note: values.note,
        method: values.method,
      },
      items: lines.map((l) => ({
        productId: l.productId,
        slug: l.slug,
        name: l.name,
        quantity: l.quantity,
        unitPrice: l.price,
        subscription: l.subscription,
        upsellDiscountPercent: l.upsellDiscountPercent,
      })),
      appliedUpsells: lines.filter((l) => l.upsellDiscountPercent).map((l) => l.productId),
      appliedPromotions: totals.appliedPromotions,
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
      },
      locale,
      attribution: getAttribution(),
    };

    const res = await submitOrder(payload);
    if (res.ok && res.orderId) {
      trackOrder(res.orderId, { total: res.total ?? totals.total, shipping: totals.shipping }, analyticsItems());
      // Before clear(): the reorder reminders and the "already bought" signal read this history.
      trackPurchase(lines.map((l) => ({ slug: l.slug, name: l.name })));
      clear();
      router.push(`/checkout/success?order=${res.orderId}`);
      return;
    }
    /*
      A line the server refused (sold out, or an offer that no longer holds) is
      taken out of the cart and named, so pressing the button again works —
      "refresh the cart" left the same line in place and the order stuck.
    */
    const culprit = res.slug ? lines.find((l) => l.slug === res.slug && (res.error !== "invalid_offer" || l.upsellDiscountPercent)) : undefined;
    if (culprit && (res.error === "out_of_stock" || res.error === "invalid_offer" || res.error === "unknown_product")) {
      removeLine(culprit.lineId);
      setServerError(te(res.error === "invalid_offer" ? "offerRemoved" : "lineRemoved", { name: culprit.name }));
    } else {
      setServerError(te(res.error ?? "failed", { phone: BRAND.contact.phone }));
    }
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocusCapture={() => {
        if (checkoutStarted.current) return;
        checkoutStarted.current = true;
        trackBeginCheckout(totals.total, analyticsItems());
      }}
      noValidate
      className="flex flex-col gap-4 lg:gap-6"
    >
      <Heading count={totals.itemCount} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          {totals.freeShippingThreshold > 0 && (
            <div className="flex flex-col gap-2 rounded-[20px] bg-tile px-4 py-3.5 lg:gap-2.5 lg:px-6 lg:py-[18px]">
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[15px] leading-5 lg:text-base">
                <span>
                  {totals.freeShippingRemaining > 0
                    ? tv.rich("freeLeft", {
                        amount: formatMoney(totals.freeShippingRemaining, locale),
                        b: (chunks) => <b>{chunks}</b>,
                      })
                    : tc("freeShippingUnlocked")}
                </span>
                <span className="hidden text-ink-2 lg:inline">
                  {formatNumber(Math.max(0, totals.subtotal - totals.discount))} / {formatMoney(totals.freeShippingThreshold, locale)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#DCDFDB] lg:h-2">
                <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
              {watch("method") !== "pickup" && (
                <FreeShippingFillers products={gapFillers(recommended, lines, totals.freeShippingRemaining)} />
              )}
            </div>
          )}

          <CartLines lines={lines} upsells={ladderSteps} />

          <Step n={1} title={t("contactSection")}>
            <div className="grid gap-3.5 lg:grid-cols-3">
              <Field label={t("name")} error={errors.name?.message}>
                <input className={inputClass} placeholder={t("namePlaceholder")} autoComplete="name" {...register("name")} />
              </Field>
              <Field label={t("phone")} error={errors.phone?.message}>
                <input className={inputClass} placeholder={t("phonePlaceholder")} inputMode="tel" autoComplete="tel" {...register("phone")} />
              </Field>
              <Field label={t("email")} error={errors.email?.message} hint={t("emailHint")}>
                <input
                  className={inputClass}
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  {...register("email")}
                />
              </Field>
            </div>
            <p className="text-sm text-muted">{tv("guestNote")}</p>
          </Step>

          <Step n={2} title={t("deliverySection")}>
            <div role="radiogroup" aria-label={t("method")} className="grid gap-2.5 lg:grid-cols-2">
              <RadioCard value="courier" {...register("method")}>
                <OptionText
                  title={t("methodCourier")}
                  note={tv("courierNote", { hours: COMMERCE.delivery.tashkent.hours, fee: formatMoney(COMMERCE.shippingFee, locale) })}
                />
              </RadioCard>
              <RadioCard value="pickup" {...register("method")}>
                <OptionText title={t("methodPickup")} note={tp("pickupNote")} />
              </RadioCard>
            </div>
            <div className="grid gap-3.5 lg:grid-cols-[260px_minmax(0,1fr)]">
              <Field label={t("region")} error={errors.region?.message}>
                <div className="relative">
                  <select className={cn(inputClass, "appearance-none pr-11")} {...register("region")}>
                    <option value="">{t("regionPlaceholder")}</option>
                    {REGION_KEYS.map((key) => (
                      <option key={key} value={tr(key)}>
                        {tr(key)}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </Field>
              <Field label={t("address")} error={errors.address?.message}>
                <input className={inputClass} placeholder={t("addressPlaceholder")} autoComplete="street-address" {...register("address")} />
              </Field>
            </div>
            <Field label={t("note")}>
              <input className={inputClass} placeholder={t("notePlaceholder")} {...register("note")} />
            </Field>
          </Step>

          {/*
            A real choice instead of a row of logos: a provider with no
            merchant id configured is shown as "tez orada" and cannot be
            picked, so the page never promises a payment route the shop
            cannot complete.
          */}
          <Step n={3} title={t("paymentTitle")}>
            <div role="radiogroup" aria-label={t("paymentTitle")} className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-2.5">
              {PAYMENT_PROVIDERS.map((p) => (
                <RadioCard
                  key={p.id}
                  name="pay-choice"
                  value={p.id}
                  checked={payChoice === p.id}
                  disabled={!p.configured}
                  onChange={() => choosePay(p.id)}
                  className={cn("p-3.5 lg:p-4", !p.configured && "cursor-not-allowed opacity-60")}
                >
                  <span className="flex flex-col items-start gap-0.5">
                    <PaymentMark id={p.id} size="sm" className="h-6 justify-start bg-transparent px-0 text-base" />
                    <span className="text-[13px] text-ink-2 lg:text-sm">{p.configured ? tv("online") : t("paySoon")}</span>
                  </span>
                </RadioCard>
              ))}
              <RadioCard name="pay-choice" value="cod" checked={payChoice === "cod"} onChange={() => choosePay("cod")} className="p-3.5 lg:p-4">
                <OptionText title={tv("codTitle")} note={tv("codSub")} bold />
              </RadioCard>
            </div>
            {errors.provider?.message && (
              <p role="alert" className="text-sm font-semibold text-red">
                {errors.provider.message}
              </p>
            )}
            <p className="text-sm text-muted">{onlinePaymentAvailable() ? tv("gatewayNote") : t("payUnavailable")}</p>
          </Step>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--header-sticky)+16px)]">
          <div className="flex flex-col gap-3.5 rounded-[20px] bg-tile p-5 lg:border lg:border-line lg:bg-bg lg:p-7 lg:shadow-buybox">
            <h2 className="hidden text-[22px] font-bold lg:block">{t("summary")}</h2>
            <SummaryRow label={tv("itemsRow", { count: totals.itemCount })} value={formatMoney(totals.subtotal, locale)} />
            {totals.discount > 0 && (
              <SummaryRow label={tc("discount")} value={`−${formatMoney(totals.discount, locale)}`} sale />
            )}
            <SummaryRow
              label={tc("shipping")}
              value={totals.shipping === 0 ? tc("free") : formatMoney(totals.shipping, locale)}
            />
            <div className="flex items-baseline justify-between gap-3 border-t border-[#DCDFDB] pt-3.5 text-[22px] font-bold lg:border-line lg:text-[26px]">
              <span>{tc("total")}</span>
              <span>{formatMoney(totals.total, locale)}</span>
            </div>
            {totals.hasSubscription && (
              <p className="text-sm text-ink-2">
                {ts("recurringSummary", { amount: formatMoney(totals.recurringTotal, locale) })} {ts("benefitControl")}
              </p>
            )}
            {savings > 0 && (
              <span className="inline-flex h-[30px] items-center self-start rounded-pill bg-chip-strong px-2.5 text-sm font-semibold">
                {tc("savings", { amount: formatMoney(savings, locale) })}
              </span>
            )}
            {serverError && (
              <p role="alert" className="rounded-sm bg-red/10 px-4 py-3 text-sm font-medium text-red">
                {serverError}
              </p>
            )}
            <Button type="submit" size="lg" className="mt-1 hidden h-14 w-full rounded-[14px] lg:inline-flex" disabled={submitting}>
              {submitting ? t("submitting") : t("submit")}
            </Button>
            {emailEntered && (
              <Checkbox {...register("subscribe")} className="items-start text-sm leading-[19px] text-ink-2">
                {t("subscribeLabel")}
              </Checkbox>
            )}
            <p className="text-[13px] leading-[18px] text-muted">
              {tv.rich("consent", {
                offer: (chunks) => <Link href="/offer" className="underline">{chunks}</Link>,
                privacy: (chunks) => <Link href="/privacy" className="underline">{chunks}</Link>,
              })}
            </p>
            <UpsellSavingsBar />
          </div>
          <div className="hidden flex-col gap-3 rounded-[20px] bg-tile px-5 py-[18px] text-sm leading-[19px] lg:flex">
            <TrustRow d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4">{tc("trustGuarantee")}</TrustRow>
            <TrustRow d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5">{tc("trustSecure")}</TrustRow>
            <TrustRow d="M4 5h16v11H9l-5 4z">{onlinePaymentAvailable() ? t("operatorNote") : t("payUnavailable")}</TrustRow>
            <PaymentMarks ids={ONLINE_PAYMENT_MARKS} size="sm" label={t("paymentTitle")} className="pt-1" />
          </div>
        </aside>
      </div>

      <div
        data-buy-bar
        className="fixed inset-x-0 bottom-[var(--tab-bar)] z-40 flex h-[var(--buy-bar)] items-center gap-2.5 border-t border-line bg-bg px-4 lg:hidden"
      >
        <div className="flex shrink-0 flex-col">
          <span className="text-[13px] text-ink-2">{tc("total")}</span>
          <span className="text-[19px] font-bold leading-[23px]">{formatMoney(totals.total, locale)}</span>
        </div>
        <Button type="submit" size="lg" className="min-w-0 flex-1 rounded-[14px]" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}

function Heading({ count, crumbsOnly = false }: { count?: number; crumbsOnly?: boolean }) {
  const tc = useTranslations("cart");
  const tv = useTranslations("cart.v3");
  const tp = useTranslations("product");
  return (
    <div className="flex flex-col gap-2 lg:gap-3.5">
      <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
        <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{tc("title")}</span>
      </nav>
      {!crumbsOnly && (
        <div className="flex items-baseline gap-2.5 lg:gap-3.5">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{tc("title")}</h1>
          {count != null && <span className="text-[15px] text-muted lg:text-[17px]">{tv("itemsCount", { count })}</span>}
        </div>
      )}
    </div>
  );
}

function EmptyCart({ recommended }: { recommended: Product[] }) {
  const tv = useTranslations("cart.v3");
  const common = useTranslations("common");
  const home = useTranslations("home");
  // Cut-out pack shots first, as on every other rail.
  const picks = recommended
    .filter((p) => p.inStock && (p.assortment ?? "core") === "core")
    .sort((a, b) => Number(!productCutout(a.slug)) - Number(!productCutout(b.slug)))
    .slice(0, 6);
  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <div className="hidden lg:block">
        <Heading crumbsOnly />
      </div>
      <section className="flex flex-col items-center gap-3.5 rounded-[28px] bg-tile px-6 py-12 text-center lg:rounded-[32px] lg:px-8 lg:py-16">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-bg">
          <svg viewBox="0 0 24 24" aria-hidden className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        </span>
        <h1 className="mt-1.5 text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{tv("emptyTitle")}</h1>
        <p className="max-w-[520px] text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{tv("emptyText")}</p>
        <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
          <Link href="/products" className={cn(buttonVariants("primary", "lg"), "h-14 rounded-[14px] px-8")}>
            {tv("emptyShop")}
          </Link>
          <Link href="/quiz" className={cn(buttonVariants("secondary", "lg"), "h-14 rounded-[14px] bg-transparent")}>
            {common("quiz")}
          </Link>
        </div>
      </section>
      {picks.length > 0 && (
        <section aria-labelledby="cart-picks" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="cart-picks" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
            {home("catalog.title")}
          </h2>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6">
            {picks.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-line p-[18px] lg:gap-[18px] lg:p-7">
      <h2 className="flex items-center gap-2.5 text-[19px] font-bold leading-[26px] lg:gap-3 lg:text-xl">
        <span aria-hidden className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-ink text-[15px] text-white lg:h-9 lg:w-9 lg:text-base">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionText({ title, note, bold = false }: { title: string; note: string; bold?: boolean }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className={cn("text-base", bold ? "font-bold" : "font-semibold")}>{title}</span>
      <span className="text-[13px] text-ink-2 lg:text-sm">{note}</span>
    </span>
  );
}

function TrustRow({ d, children }: { d: string; children: ReactNode }) {
  return (
    <span className="flex gap-2.5">
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
      {children}
    </span>
  );
}

function SummaryRow({ label, value, sale }: { label: string; value: string; sale?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-base">
      <span className="text-ink-2">{label}</span>
      <span className={sale ? "font-semibold text-red" : undefined}>{value}</span>
    </div>
  );
}

/*
  The error used to be a span inside the <label>, which made it part of the
  control's accessible *name*. So the message sits outside the label, is tied
  to the control by id, and the control gets aria-invalid. role="alert" so a
  message appearing after the submit button was pressed is announced.
*/
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");
  const control = cloneElement(children, {
    id: fieldId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  });

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      {control}
      {hint && (
        <span id={hintId} className="text-[13px] text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-red">
          {error}
        </span>
      )}
    </div>
  );
}
