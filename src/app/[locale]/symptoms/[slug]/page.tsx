import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { loadHealthTopicPage } from "@/lib/content/health-topic-loader";
import { HealthTopicTemplate } from "@/components/health/HealthTopicTemplate";
import { healthTopicMetadata, HealthTopicJsonLd } from "@/lib/seo/health-topic";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return healthTopicMetadata(slug, locale, "symptom");
}

export default async function HealthSymptomPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await loadHealthTopicPage(slug, locale, "symptom");
  if (!data) notFound();

  return (
    <>
      <HealthTopicJsonLd topic={data.topic} locale={locale} reviewer={data.reviewer} />
      <HealthTopicTemplate
        topic={data.topic}
        products={data.products}
        ingredients={data.ingredients}
        related={data.related}
        reviewer={data.reviewer}
        locale={locale}
      />
    </>
  );
}
