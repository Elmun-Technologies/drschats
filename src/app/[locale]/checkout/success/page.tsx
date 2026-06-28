import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { PurchaseTracker } from "@/components/personalization/PurchaseTracker";

export const metadata: Metadata = { robots: { index: false } };

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

  return (
    <div className="flex min-h-[80svh] items-center pt-10">
      <Container size="narrow">
        <PurchaseTracker />
        <div className="flex flex-col items-center text-center">
          {/* Animated checkmark */}
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full bg-accent-soft" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 max-w-md text-lg text-muted">{t("subtitle")}</p>

          {order && (
            <div className="mt-6 rounded-2xl border border-line bg-surface px-6 py-4">
              <p className="text-xs text-faint">{t("orderId")}</p>
              <p className="mt-1 font-display text-lg font-bold text-accent">{order}</p>
            </div>
          )}

          {/* What happens next */}
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            {[
              { step: "1", text: t("step1") },
              { step: "2", text: t("step2") },
              { step: "3", text: t("step3") },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-line bg-surface p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">
                  {s.step}
                </span>
                <p className="mt-3 text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>

          <Link href="/" className={buttonVariants("primary", "lg") + " mt-10"}>
            {t("home")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
