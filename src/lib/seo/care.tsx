import type { Locale } from "@/lib/i18n/routing";
import { getCommerceSettings } from "@/lib/commerce/server";
import { CARE_PATH, careCopy, fillPercents, type CareKind } from "@/lib/care/content";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

/** Breadcrumb and FAQ for /care/mom and /care/baby — the FAQ text is exactly what the page shows. */
export async function CareJsonLd({ kind, locale }: { kind: CareKind; locale: Locale }) {
  const copy = careCopy(kind, locale);
  const { subscription } = await getCommerceSettings();
  const percents = { firstPercent: subscription.firstPercent, recurringPercent: subscription.recurringPercent };
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: copy.breadcrumb, url: `${SITE_URL}/${locale}${CARE_PATH[kind]}` }])} />
      <JsonLd data={faqLd(copy.faq.map((f) => ({ question: f.question, answer: fillPercents(f.answer, percents) })))} />
    </>
  );
}
