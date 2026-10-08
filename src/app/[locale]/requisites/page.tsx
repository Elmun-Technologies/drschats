import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { BRAND } from "@/lib/brand";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "requisites", "/requisites");
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
    <InfoShell crumb={t("crumb")}>
      <JsonLd data={organizationLd(locale)} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/requisites` }])} />
      <InfoHeader title={t("title")} lead={t("subtitle")} />
      <dl className="flex flex-col rounded-[20px] border border-line px-5 py-2 lg:px-7">
        {rows.map((r, i) => (
          <div key={r.label} className={`flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between sm:gap-6 ${i < rows.length - 1 ? "border-b border-line" : ""}`}>
            <dt className="text-[15px] text-ink-2">{r.label}</dt>
            <dd className="text-[15px] font-semibold sm:max-w-[60%] sm:text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
    </InfoShell>
  );
}
