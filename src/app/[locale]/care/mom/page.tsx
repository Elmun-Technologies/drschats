import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import { CareJsonLd } from "@/lib/seo/care";
import { CareTemplate } from "@/components/care/CareTemplate";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "careMom", "/care/mom");
}

export default async function CareMomPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <CareJsonLd kind="mom" locale={locale} />
      <CareTemplate kind="mom" locale={locale} />
    </>
  );
}
