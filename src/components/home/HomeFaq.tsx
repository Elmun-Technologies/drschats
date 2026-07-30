import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
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
    <section className="border-t border-line py-20 sm:py-24">
      <JsonLd data={faqLd(items)} />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="mb-2 text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
          <FaqAccordion items={items} />
        </div>
      </Container>
    </section>
  );
}
