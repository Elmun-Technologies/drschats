import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { InfoTable } from "@/components/page/InfoTable";
import { BRAND } from "@/lib/brand";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.requisites" });
  return buildPageMetadata({ locale, path: "/requisites", title: `${t("title")} — Go Vita`, description: t("subtitle") });
}

export default async function RequisitesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.requisites");
  const tr = await getTranslations("pages.requisites");

  /*
    Built from BRAND rather than from a list in the translation files.

    The old list carried a bank account number, an MFO and a BIC that were typed
    once into a JSON file and never checked against anything — and an email
    address (info@alimkhanov.com) on a domain the shop does not use. Legal
    identifiers are facts; they belong in one file that a lawyer can read. Rows
    whose value is not known yet say so in the copy instead of showing a guess.
  */
  const rows = [
    { label: tr("labels.name"), value: BRAND.legalName },
    { label: tr("labels.importer"), value: BRAND.legal.importer },
    { label: tr("labels.address"), value: locale === "ru" ? BRAND.legal.addressRu : BRAND.legal.address },
    BRAND.legal.stir
      ? { label: tr("labels.stir"), value: BRAND.legal.stir }
      : { label: tr("labels.stir"), value: tr("pendingValue") },
    BRAND.legal.licence
      ? { label: tr("labels.licence"), value: BRAND.legal.licence }
      : { label: tr("labels.licence"), value: tr("pendingValue") },
    { label: tr("labels.director"), value: BRAND.legal.director },
    { label: tr("labels.registeredAt"), value: BRAND.legal.registeredAt },
    { label: tr("labels.activity"), value: BRAND.legal.activity },
    { label: tr("labels.phone"), value: BRAND.contact.phone },
    { label: tr("labels.email"), value: BRAND.contact.email },
    { label: tr("labels.b2b"), value: BRAND.contact.b2bEmail },
    { label: tr("labels.source"), value: BRAND.legal.source },
  ];

  return (
    <div className="pb-24">
      <JsonLd data={organizationLd(locale)} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/requisites` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <InfoTable rows={rows} />
    </div>
  );
}
