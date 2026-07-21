import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { TrackView } from "@/components/track/TrackView";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "track" });
  return buildPageMetadata({ locale, path: "/track", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function TrackPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("track");

  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/track` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <TrackView />
    </div>
  );
}
