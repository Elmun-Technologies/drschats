import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Link } from "@/lib/i18n/navigation";
import { PHARMACY_CHAINS } from "@/lib/content/pharmacies";
import { InfoShell } from "@/components/info/InfoShell";
import { PartnerForm } from "@/components/info/LeadForms";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.v3.partners" });
  return buildPageMetadata({ locale, path: "/partners", title: `${t("title")} — Go Vita`, description: t("lead") });
}

/*
  Design: PartnersV3. The B2B door: three kinds of partnership and one
  application form, delivered to the operator's Telegram group
  (app/actions/leads.ts). The pharmacy chains that already stock the brands
  stay on /where-to-buy, linked from here.
*/
export default async function PartnersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const kinds = ["pharmacy", "distribution", "corporate"] as const;

  return (
    <InfoShell active="partners" crumb={t("partners.title")}>
      <JsonLd data={breadcrumbLd([{ name: t("partners.title"), url: `${SITE_URL}/${locale}/partners` }])} />

      <div className="flex flex-col overflow-hidden rounded-[24px] bg-dark-panel text-white lg:flex-row lg:rounded-[28px]">
        <div className="flex flex-col items-start gap-3 p-6 lg:flex-1 lg:gap-4 lg:p-10">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-on-dark-2">{t("partners.eyebrow")}</span>
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{t("partners.title")}</h1>
          <p className="text-base leading-6 text-on-dark-2 lg:text-[17px] lg:leading-[26px]">{t("partners.lead")}</p>
          <a
            href="#partner-form"
            className={cn(buttonVariants("primary"), "mt-2 bg-bg text-ink hover:bg-tile hover:text-ink focus-visible:ring-white focus-visible:ring-offset-dark-panel")}
          >
            {t("partners.cta")}
          </a>
        </div>
        <div className="relative h-48 lg:h-auto lg:w-[44%]">
          <Image src="/images/stock/st-pharmacist-help.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {kinds.map((k) => (
          <div key={k} className="flex flex-col gap-2 rounded-[20px] bg-tile p-5 lg:p-6">
            <h2 className="text-xl font-bold">{t(`partners.kinds.${k}.title`)}</h2>
            <p className="text-[15px] leading-[22px] text-ink-2">{t(`partners.kinds.${k}.text`)}</p>
          </div>
        ))}
      </div>

      <section id="partner-form" aria-labelledby="partner-form-title" className="flex scroll-mt-[var(--header-sticky)] flex-col gap-5 rounded-[20px] border border-line p-5 lg:p-8">
        <h2 id="partner-form-title" className="text-[22px] font-bold leading-7 lg:text-[26px]">{t("partners.formTitle")}</h2>
        <PartnerForm />
      </section>

      <div className="flex flex-col gap-4 rounded-[20px] border border-line p-5 lg:flex-row lg:items-center lg:justify-between lg:p-7">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold">{t("partners.whereTitle")}</h2>
          <p className="text-[15px] text-ink-2">{PHARMACY_CHAINS.map((c) => c.name).join(", ")}</p>
        </div>
        <Link href="/where-to-buy" className={cn(buttonVariants("secondary"), "shrink-0 self-start lg:self-center")}>
          {t("partners.whereCta")}
        </Link>
      </div>
    </InfoShell>
  );
}
