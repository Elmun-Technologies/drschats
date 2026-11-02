import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { trackingAvailable } from "@/lib/orders/track";
import { TrackForm } from "@/components/track/TrackForm";
import { BRAND } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";

/*
  Rendered per request: whether orders are in our database is a runtime fact,
  and the Docker build has no DATABASE_URL — a prerendered page would answer
  "no tracking" forever.
*/
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "track" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

/* Orders live in our own database only; without it the page says how to ask instead of offering a form. */
export default async function TrackPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("track"), getTranslations("contact")]);
  return (
    <div className="wrap flex max-w-[760px] flex-col gap-5 pb-12 pt-6 lg:gap-7 lg:pb-20 lg:pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{t("title")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px]">{t("lead")}</p>
      </div>
      {trackingAvailable ? (
        <TrackForm />
      ) : (
        <div className="flex flex-col gap-4 rounded-[20px] border border-line p-5 lg:p-8">
          <p className="text-base leading-6 text-ink-2">{t("byOperator", { hours: tc("workHours") })}</p>
          <div className="flex flex-wrap gap-2.5">
            <a href={`tel:${BRAND.contact.phoneHref}`} className={buttonVariants("primary")}>{BRAND.contact.phone}</a>
            <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("secondary")}>Telegram</a>
          </div>
        </div>
      )}
    </div>
  );
}
