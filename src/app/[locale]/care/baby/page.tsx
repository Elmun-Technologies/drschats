import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import { CareJsonLd } from "@/lib/seo/care";
import { CareTemplate } from "@/components/care/CareTemplate";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "careBaby", "/care/baby");
}

export default async function CareBabyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <CareJsonLd kind="baby" locale={locale} />
      <CareTemplate kind="baby" locale={locale} />
    </>
  );
}
