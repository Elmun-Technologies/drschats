import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { JsonLd, itemListLd } from "@/lib/seo/jsonld";
import { TopicIndex } from "@/components/health/TopicIndex";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "symptoms", "/symptoms");
}

export default async function HealthSymptomsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, topics] = await Promise.all([
    getTranslations("health.symptom"),
    getHealthTopics(locale, "symptom"),
  ]);

  return (
    <>
      <JsonLd
        data={itemListLd(
          t("indexTitle"),
          topics.map((topic) => ({ name: topic.name, description: topic.headline })),
        )}
      />
      <TopicIndex
        kind="symptom"
        eyebrow={t("plural")}
        title={t("indexTitle")}
        subtitle={t("indexSubtitle")}
        emptyLabel={t("empty")}
        topics={topics}
      />
    </>
  );
}
