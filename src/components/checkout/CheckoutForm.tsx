"use client";

import { cloneElement, isValidElement, useId, useState, type ReactElement } from "react";

/*
  Regions are keyed, not hardcoded strings.

  They used to be a flat Uzbek array, so a Russian-speaking customer met a
  bilingual site that switched to Uzbek at the one field they cannot skip. The
  key is what travels to the backend, so an order stays readable whichever
  language it was placed in.
*/
const REGION_KEYS = [
  "tashkentCity",
  "tashkent",
  "samarkand",
  "fergana",
  "andijan",
  "namangan",
  "bukhara",
  "khorezm",
  "kashkadarya",
  "surkhandarya",
  "syrdarya",
  "jizzakh",
  "navoi",
  "karakalpakstan",
] as const;

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { OrderRequest, Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals } from "@/lib/cart/pricing";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { submitOrder } from "@/app/[locale]/checkout/actions";
import { getAttribution, trackLead } from "@/lib/analytics/events";
import { buildUpsellLadder } from "@/lib/upsell/ladder";
import { UpsellSavingsBar } from "@/components/upsell/UpsellSavingsBar";

export function CheckoutForm({ recommended }: { recommended: Product[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const tr = useTranslations("checkout.regions");
  const tc = useTranslations("cart");
  const ts = useTranslations("subscription");
  const router = useRouter();
  const { lines, add, setQuantity } = useCart();
  const clear = useCart((s) => s.clear);
  const promotions = usePromotions();
  const totals = computeTotals(lines, promotions);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    subscribe: z.boolean().optional(),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: "courier", subscribe: false },
  });

  const emailEntered = Boolean(watch("email"));

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-lg text-muted">{tc("empty")}</p>
        <Link href="/products" className={buttonVariants("primary")}>
          {tc("emptyCta")}
        </Link>
      </div>
    );
  }

  const ladderSteps = buildUpsellLadder(lines, recommended);

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
      trackLead(res.orderId, totals.total);
      clear();
      router.push(`/checkout/success?order=${res.orderId}`);
    } else {
      setServerError(res.message ?? "Error");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 [order:1] lg:[order:1]">
        <fieldset className="space-y-5">
          <legend className="mb-2 font-display text-xl font-semibold">{t("contactSection")}</legend>
          <Field label={t("name")} error={errors.name?.message}>
            <input className={inputClass} placeholder={t("namePlaceholder")} {...register("name")} />
          </Field>
          <Field label={t("phone")} error={errors.phone?.message}>
            <input className={inputClass} placeholder={t("phonePlaceholder")} inputMode="tel" {...register("phone")} />
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
          {emailEntered && (
            <label className="flex items-start gap-3 text-sm text-muted">
              <input
                type="checkbox"
                {...register("subscribe")}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
              />
              <span>{t("subscribeLabel")}</span>
            </label>
          )}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-2 font-display text-xl font-semibold">{t("deliverySection")}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("region")} error={errors.region?.message}>
              <select className={inputClass} {...register("region")}>
                <option value="">{t("regionPlaceholder")}</option>
                {REGION_KEYS.map((key) => (
                  <option key={key} value={tr(key)}>
                    {tr(key)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("method")}>
              <select className={inputClass} {...register("method")}>
                <option value="courier">{t("methodCourier")}</option>
                <option value="pickup">{t("methodPickup")}</option>
              </select>
            </Field>
          </div>
          <Field label={t("address")} error={errors.address?.message}>
            <input className={inputClass} placeholder={t("addressPlaceholder")} {...register("address")} />
          </Field>
          <Field label={t("note")}>
            <textarea rows={3} className={inputClass} placeholder={t("notePlaceholder")} {...register("note")} />
          </Field>
          <div className="rounded-2xl border border-line/60 bg-surface p-4 space-y-2">
            <p className="text-xs font-bold text-fg uppercase tracking-wider">{t("paymentMethodsTitle")}:</p>
            <div className="flex flex-wrap gap-2">
              {["Click", "Payme", "Uzcard", "Humo"].map((pm) => (
                <span key={pm} className="rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-xs font-bold text-fg shadow-xs">
                  ✓ {pm}
                </span>
              ))}
              <span className="rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-xs font-bold text-fg shadow-xs">
                ✓ {t("paymentCash")}
              </span>
            </div>
            <p className="text-xs text-muted pt-1">{t("paymentNote")}</p>
          </div>
        </fieldset>

        {/* Upsell Ladder */}
        {ladderSteps.length > 0 && (
          <fieldset>
            <legend className="mb-4 font-display text-xl font-semibold">{t("upsellTitle")}</legend>
            <div className="space-y-3">
              {ladderSteps.map((step, i) => (
                <div
                  key={step.product.id}
                  className={`flex items-center gap-4 rounded-xl border p-3 transition-all ${
                    step.stepType === "free_gift"
                      ? "border-gold/50 bg-gradient-to-r from-gold/10 to-surface"
                      : "border-line bg-surface"
                  }`}
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    <Image src={step.product.images[0]?.url ?? ""} alt={step.product.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-faint">{step.reason}</p>
                    <p className="text-sm font-medium">{step.product.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-faint line-through">{formatMoney(step.product.price, locale)}</span>
                      {step.stepType === "free_gift" ? (
                        <span className="font-display text-sm font-bold text-gold-ink">{t("upsellFree")}</span>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-accent">{formatMoney(step.discountedPrice, locale)}</span>
                          <Badge tone="gold">−{step.discountPercent}%</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      add({
                        productId: step.product.id,
                        slug: step.product.slug,
                        name: step.product.name,
                        image: step.product.images[0]?.url ?? "",
                        price: step.product.price,
                        oldPrice: step.product.oldPrice,
                        upsellDiscountPercent: step.discountPercent,
                      })
                    }
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      step.stepType === "free_gift"
                        ? "bg-gold text-ink hover:bg-gold-ink"
                        : "bg-surface-3 text-fg hover:bg-accent hover:text-ink"
                    }`}
                  >
                    {step.stepType === "free_gift" ? t("upsellFree") : t("upsellAdd")}
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {/* role="alert": the submit failure appears after the button was
            pressed, so it has to announce itself rather than wait to be found. */}
        {serverError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {serverError}
          </p>
        )}

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? t("submitting") : t("submit")}
          </Button>
          <p className="text-center text-sm text-muted">{t("operatorNote")}</p>
        </div>
      </form>

      {/* Summary */}
      <aside className="[order:2] lg:[order:2] lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">{t("summary")}</h2>
          <div className="space-y-4">
            {lines.map((l) => (
              <div key={l.lineId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {l.image && <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{l.name}</p>
                  {l.oldPrice && l.oldPrice > l.price && (
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted line-through">{formatMoney(l.oldPrice, locale)}</span>
                      <Badge tone="gold" className="px-1.5 py-0 text-[10px]">
                        −{Math.round((1 - l.price / l.oldPrice) * 100)}%
                      </Badge>
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                    {/*
                      Stopping at 1 rather than letting "−" fall through to 0.
                      The store treats 0 as "remove", so one more press than
                      intended deleted the product from the order with no
                      warning and nothing to undo it with. Removing is now its
                      own labelled control.
                    */}
                    <button
                      type="button"
                      onClick={() => setQuantity(l.lineId, l.quantity - 1)}
                      disabled={l.quantity <= 1}
                      aria-label={t("decreaseFor", { name: l.name })}
                      className="rounded px-1.5 hover:text-accent-strong disabled:opacity-40"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="min-w-4 text-center tabular-nums">
                      {l.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(l.lineId, l.quantity + 1)}
                      aria-label={t("increaseFor", { name: l.name })}
                      className="rounded px-1.5 hover:text-accent-strong"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity(l.lineId, 0)}
                      aria-label={t("removeFor", { name: l.name })}
                      className="ml-2 rounded px-1.5 text-faint hover:text-danger"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <span className="text-sm">{formatMoney(l.price * l.quantity, locale)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <SummaryRow label={tc("subtotal")} value={formatMoney(totals.subtotal, locale)} />
            {totals.discount > 0 && (
              <SummaryRow label={tc("discount")} value={`−${formatMoney(totals.discount, locale)}`} accent />
            )}
            <SummaryRow
              label={tc("shipping")}
              value={totals.shipping === 0 ? tc("free") : formatMoney(totals.shipping, locale)}
            />
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold">
              <span>{tc("total")}</span>
              <span>{formatMoney(totals.total, locale)}</span>
            </div>
            {totals.hasSubscription && (
              <p className="pt-1 text-xs text-muted">
                {ts("recurringSummary", { amount: formatMoney(totals.recurringTotal, locale) })}{" "}
                {ts("benefitControl")}
              </p>
            )}
            {(() => {
              const totalSavings = lines.reduce((acc, l) => acc + ((l.oldPrice ?? l.price) - l.price) * l.quantity, 0) + totals.discount;
              if (totalSavings > 0) {
                return (
                  <div className="mt-4 rounded-xl border border-gold/25 bg-gold/10 p-3 text-center">
                    <p className="text-sm font-semibold text-brand-deep">
                      {t("savings", { amount: formatMoney(totalSavings, locale) })}
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
          <UpsellSavingsBar />
        </div>
      </aside>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

/*
  The error used to be a span inside the <label>, which made it part of the
  control's accessible *name* — a screen reader announced the name field as
  "Ism familiya Bu maydon majburiy" rather than reading the reason as a
  description. Nothing was marked invalid either.

  So the message moves out of the label and is tied to the control by id, and
  the control gets aria-invalid. role="alert" so a message appearing after the
  submit button was pressed is announced rather than waited for.
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
  children: React.ReactNode;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  // The hint stays announced even when an error appears: "we email the receipt
  // here" is why the field exists, and losing it mid-correction is confusing.
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: fieldId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })
    : children;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-medium text-muted">
        {label}
      </label>
      {control}
      {hint && (
        <span id={hintId} className="mt-1 block text-xs text-faint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent" : "text-fg"}>{value}</span>
    </div>
  );
}
