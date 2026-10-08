import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";

interface RawFaq {
  question: string;
  answer: string;
}

/** Storefront-level FAQ — also emitted as FAQPage structured data. */
export async function HomeFaq() {
  const t = await getTranslations("home.faq");
  const items = t.raw("items") as RawFaq[];

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Section tone="surface">
      <JsonLd data={faqLd(items)} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-legacy-muted">{t("eyebrow")}</p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-balance text-fg sm:text-3xl">{t("title")}
          </h2>
          <p className="mt-3 text-pretty text-legacy-muted">{t("subtitle")}</p>
        </div>
        <FaqAccordion items={items} />
      </div>
    </Section>
  );
}
