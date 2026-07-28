import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Expert } from "@/lib/content/experts.sanity";
import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { getHealthTopic } from "@/lib/content/health-topics.sanity";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, faqLd, organizationNode } from "@/lib/seo/jsonld";

export function topicUrl(kind: HealthTopicKind, slug: string, locale: Locale) {
  return `${SITE_URL}/${locale}${TOPIC_BASE_PATH[kind]}/${slug}`;
}

export async function healthTopicMetadata(
  slug: string,
  locale: Locale,
  kind: HealthTopicKind,
): Promise<Metadata> {
  const topic = await getHealthTopic(slug, locale);
  if (!topic || topic.kind !== kind) return {};

  return buildPageMetadata({
    locale,
    path: `${TOPIC_BASE_PATH[kind]}/${slug}`,
    title: `${topic.name} — ${topic.headline} | ${SITE_NAME}`,
    description: topic.intro,
  });
}

/**
 * MedicalWebPage carries the doctor who reviewed the copy, which is the whole
 * point of the E-E-A-T layer: health pages that name a credentialed reviewer
 * are treated very differently from anonymous ones.
 */
export async function HealthTopicJsonLd({
  topic,
  locale,
  reviewer,
}: {
  topic: HealthTopic;
  locale: Locale;
  reviewer?: Expert;
}) {
  const t = await getTranslations("health");
  const prod = await getTranslations("product");
  const url = topicUrl(topic.kind, topic.slug, locale);

  const webPage = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#webpage`,
        url,
        name: topic.name,
        headline: topic.headline,
        description: topic.intro,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        ...(reviewer
          ? {
              reviewedBy: {
                "@type": "Person",
                name: reviewer.name,
                jobTitle: reviewer.title,
                url: `${SITE_URL}/${locale}/experts/${reviewer.slug}`,
              },
            }
          : {}),
        ...(topic.sections.length > 0
          ? {
              mainContentOfPage: {
                "@type": "WebPageElement",
                cssSelector: "article",
              },
            }
          : {}),
      },
      organizationNode(),
    ],
  };

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd
        data={breadcrumbLd([
          { name: prod("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
          {
            name: t(`${topic.kind}.plural`),
            url: `${SITE_URL}/${locale}${TOPIC_BASE_PATH[topic.kind]}`,
          },
          { name: topic.name, url },
        ])}
      />
      {topic.faq.length > 0 && <JsonLd data={faqLd(topic.faq)} />}
    </>
  );
}
