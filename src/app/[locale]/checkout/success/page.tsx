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

          {/* Telegram bot tracking */}
          <a
            href="https://t.me/drschatsstorebot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex w-full items-center gap-4 rounded-2xl border border-[#229ED9]/30 bg-[#229ED9]/5 px-5 py-4 text-left transition-colors hover:bg-[#229ED9]/10"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#229ED9]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-fg">{t("trackBot")}</p>
              <p className="mt-0.5 text-sm text-muted">{t("trackBotDesc")}</p>
            </div>
            <span className="flex-shrink-0 text-[#229ED9]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
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
