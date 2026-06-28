"use client";

import { useState } from "react";
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
  const tc = useTranslations("cart");
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
    region: z.string().min(1, t("errorRequired")),
    address: z.string().min(3, t("errorRequired")),
    note: z.string().optional(),
    method: z.enum(["courier", "pickup"]),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: "courier" },
  });

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
      customer: { name: values.name, phone: values.phone },
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <fieldset className="space-y-5">
          <legend className="mb-2 font-display text-xl font-semibold">{t("contactSection")}</legend>
          <Field label={t("name")} error={errors.name?.message}>
            <input className={inputClass} placeholder={t("namePlaceholder")} {...register("name")} />
          </Field>
          <Field label={t("phone")} error={errors.phone?.message}>
            <input className={inputClass} placeholder={t("phonePlaceholder")} inputMode="tel" {...register("phone")} />
          </Field>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-2 font-display text-xl font-semibold">{t("deliverySection")}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("region")} error={errors.region?.message}>
              <input className={inputClass} placeholder={t("regionPlaceholder")} {...register("region")} />
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
          <p className="text-sm text-muted">{t("paymentNote")}</p>
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
                      ? "border-amber-400/50 bg-gradient-to-r from-amber-950/30 to-surface"
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
                        <span className="font-display text-sm font-bold text-amber-400">BEPUL 🎁</span>
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
                        ? "bg-amber-400 text-ink hover:bg-amber-300"
                        : "bg-surface-3 text-fg hover:bg-accent hover:text-ink"
                    }`}
                  >
                    {step.stepType === "free_gift" ? "Olish" : `+${i + 1}`}
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? t("submitting") : t("submit")}
          </Button>
          <p className="text-center text-sm text-muted">{t("operatorNote")}</p>
        </div>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">{t("summary")}</h2>
          <div className="space-y-4">
            {lines.map((l) => (
              <div key={l.productId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {l.image && <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{l.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <button type="button" onClick={() => setQuantity(l.productId, l.quantity - 1)} className="px-1.5 hover:text-accent">−</button>
                    <span>{l.quantity}</span>
                    <button type="button" onClick={() => setQuantity(l.productId, l.quantity + 1)} className="px-1.5 hover:text-accent">+</button>
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
          </div>
          <UpsellSavingsBar />
        </div>
      </aside>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
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
