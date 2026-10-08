import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { BRAND } from "@/lib/brand";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "licenses", "/licenses");
}

export default async function LicensesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const items = (t.raw("licenses.items") as { tag: string; title: string; text: string }[]).map((item) => ({
    ...item,
    text: item.text.replace("{legalName}", BRAND.legalName),
  }));

  return (
    <InfoShell active="licenses" crumb={t("nav.licenses")}>
      <JsonLd data={itemListLd(t("nav.licenses"), items.map((i) => ({ name: i.title, description: i.text })))} />
      <JsonLd data={breadcrumbLd([{ name: t("nav.licenses"), url: `${SITE_URL}/${locale}/licenses` }])} />
      <InfoHeader title={t("nav.licenses")} lead={t("licenses.lead")} />

      <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {items.map((item, i) => (
          <li key={item.title} className="flex gap-4 rounded-[20px] border border-line p-5 lg:gap-5 lg:p-6">
            <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-tile">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5zM14 3v5h5M9 14l2 2 4-4" />
              </svg>
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex h-6 w-fit items-center rounded-pill bg-chip-strong px-2.5 text-[13px] font-semibold">{item.tag}</span>
              <h2 className="text-lg font-bold leading-6">{item.title}</h2>
              <p className="text-[15px] leading-[22px] text-ink-2">{item.text}</p>
              {i === 0 && BRAND.legal.licence && (
                <p className="text-[15px] font-semibold">{t("licenses.licenceNo", { number: BRAND.legal.licence })}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-5 rounded-[24px] bg-dark-panel p-6 text-white lg:flex-row lg:items-center lg:justify-between lg:px-9 lg:py-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold lg:text-[28px]">{t("licenses.ctaTitle")}</h2>
          <p className="max-w-[620px] text-[15px] leading-[22px] text-on-dark-2 lg:text-base lg:leading-6">{t("licenses.ctaText")}</p>
        </div>
        <a
          href={BRAND.social.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants("primary", "lg"), "shrink-0 self-start bg-bg text-ink hover:bg-tile hover:text-ink focus-visible:ring-white focus-visible:ring-offset-dark-panel lg:self-center")}
        >
          {t("licenses.cta")}
        </a>
      </div>

      <p className="text-sm text-muted">{t("licenses.note")}</p>
    </InfoShell>
  );
}
