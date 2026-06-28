import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

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
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 max-w-md text-lg text-muted">{t("subtitle")}</p>
          {order && (
            <p className="mt-6 rounded-full border border-line bg-surface px-5 py-2 text-sm">
              {t("orderId")}: <span className="font-semibold text-accent">{order}</span>
            </p>
          )}
          <Link href="/" className={buttonVariants("primary", "lg") + " mt-10"}>
            {t("home")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
