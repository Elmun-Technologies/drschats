import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { JsonLd, itemListLd } from "@/lib/seo/jsonld";
import { TopicIndex } from "@/components/health/TopicIndex";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "health.vitamin" });
  return buildPageMetadata({
    locale,
    path: "/vitamins",
    title: `${t("indexTitle")} — ${SITE_NAME}`,
    description: t("indexSubtitle"),
  });
}

export default async function VitaminGuideIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, topics] = await Promise.all([
    getTranslations("health.vitamin"),
    getHealthTopics(locale, "vitamin"),
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
        kind="vitamin"
        eyebrow={t("plural")}
        title={t("indexTitle")}
        subtitle={t("indexSubtitle")}
        emptyLabel={t("empty")}
        topics={topics}
      />
    </>
  );
}
