import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Link } from "@/lib/i18n/navigation";
import { COMMERCE } from "@/lib/config/commerce";
import { buttonVariants } from "@/components/ui/Button";
import { InfoFaq, InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { cn } from "@/lib/utils";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "guarantee", "/guarantee");
}

const POINT_ICONS = [
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
];

export default async function GuaranteePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const g = await getTranslations("pages.guarantee");
  const faq = g.raw("faq") as { question: string; answer: string }[];
  const days = COMMERCE.returns.unopenedWindowDays;
  const steps = t.raw("guarantee.steps") as string[];
  const cards = (t.raw("guarantee.cards") as { title: string; text: string }[]).map((c) => ({
    title: c.title.replace("{days}", String(days)),
    text: c.text.replace("{days}", String(days)),
  }));

  return (
    <InfoShell active="guarantee" crumb={t("nav.guarantee")}>
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: t("nav.guarantee"), url: `${SITE_URL}/${locale}/guarantee` }])} />
      <InfoHeader title={t("nav.guarantee")} lead={t("guarantee.lead")} />

      <div className="flex flex-col gap-5 rounded-[20px] bg-dark-panel p-6 text-white lg:flex-row lg:items-center lg:gap-10 lg:rounded-[28px] lg:px-9 lg:py-8">
        <div className="flex shrink-0 items-baseline gap-3 lg:w-[220px] lg:flex-col lg:gap-1">
          <span className="text-[56px] font-bold leading-none tracking-[-0.03em] lg:text-[88px]">{days}</span>
          <span className="text-[15px] text-on-dark-2 lg:text-[17px]">{t("guarantee.bigLabel")}</span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold leading-7 lg:text-[26px] lg:leading-8">{t("guarantee.heroTitle", { days })}</h2>
          <p className="text-[15px] leading-[22px] text-on-dark-2 lg:text-base lg:leading-6">{t("guarantee.heroText")}</p>
        </div>
      </div>

      <section aria-labelledby="return-steps" className="flex flex-col gap-4">
        <h2 id="return-steps" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{t("guarantee.stepsTitle")}</h2>
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 rounded-[20px] bg-tile p-5 lg:flex-col lg:p-6">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">{i + 1}</span>
              <span className="text-base font-semibold leading-6 lg:text-[17px]">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col gap-2 rounded-[20px] border border-line p-5 lg:p-6">
            <h3 className="text-lg font-bold lg:text-xl">{c.title}</h3>
            <p className="text-[15px] leading-[22px] text-ink-2">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-[20px] bg-tile p-5 lg:flex-row lg:items-center lg:justify-between lg:px-7 lg:py-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{t("guarantee.devicesTitle")}</h2>
          <p className="text-[15px] leading-[22px] text-ink-2">{t("guarantee.devicesText")}</p>
        </div>
        <Link href="/contact" className={cn(buttonVariants("primary"), "shrink-0 self-start lg:self-center")}>
          {t("guarantee.devicesCta")}
        </Link>
      </div>

      <InfoFaq title={t("faqTitle")} items={faq} />
    </InfoShell>
  );
}
