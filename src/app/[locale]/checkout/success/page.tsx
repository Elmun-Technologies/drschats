import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { PurchaseTracker } from "@/components/personalization/PurchaseTracker";
import { SuccessCheckmark } from "@/components/checkout/SuccessCheckmark";

export const metadata: Metadata = { robots: { index: false } };

const steps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    key: "step1",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    key: "step2",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    key: "step3",
  },
];

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkout.success");

  const shortOrder = order ? order.slice(-8).toUpperCase() : null;

  return (
    <div className="flex min-h-[80svh] items-center py-16">
      <Container size="narrow">
        <PurchaseTracker />
        <div className="flex flex-col items-center text-center">
          <SuccessCheckmark />

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 max-w-sm text-lg text-muted">{t("subtitle")}</p>

          {shortOrder && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-4">
              <div className="text-left">
                <p className="text-xs text-faint">{t("orderId")}</p>
                <p className="mt-0.5 font-mono text-xl font-bold tracking-widest text-accent">#{shortOrder}</p>
              </div>
            </div>
          )}

          <div className="mt-10 w-full">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-faint">{t("whatsNext")}</p>
            <div className="grid gap-3 text-left sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.key} className="relative rounded-2xl border border-line bg-surface p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      {s.icon}
                    </span>
                    <span className="text-xs font-bold text-faint">{t("stepLabel", { n: i + 1 })}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{t(s.key as "step1")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/" className={buttonVariants("primary", "lg")}>
              {t("home")}
            </Link>
            <Link href="/products" className={buttonVariants("ghost", "lg")}>
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
