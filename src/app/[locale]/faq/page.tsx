import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;

type FaqCategory = {
  title: string;
  items: { question: string; answer: string }[];
};

function slugify(index: number) {
  return `cat-${index + 1}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return buildPageMetadata({
    locale,
    path: "/faq",
    title: `${t("title")} — Alimkhanov`,
    description: t("subtitle"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faqPage");

  const categories = t.raw("categories") as FaqCategory[];
  const allItems = categories.flatMap((c) => c.items);

  return (
    <div className="pb-32">
      <JsonLd data={faqLd(allItems)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Alimkhanov", url: `${SITE_URL}/${locale}` },
          { name: t("crumb"), url: `${SITE_URL}/${locale}/faq` },
        ])}
      />

      <PageHero
        crumb={t("crumb")}
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          {/* Sticky category rail */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">
                {t("navLabel")}
              </p>
              <ul className="space-y-1">
                {categories.map((c, i) => (
                  <li key={slugify(i)}>
                    <a
                      href={`#${slugify(i)}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-accent-strong"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                        {i + 1}
                      </span>
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Accordions */}
          <div className="min-w-0 space-y-16">
            {categories.map((c, i) => (
              <section key={slugify(i)} id={slugify(i)} className="scroll-mt-24">
                <Reveal>
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-ink">
                      {i + 1}
                    </span>
                    <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {c.title}
                    </h2>
                  </div>
                </Reveal>
                <Reveal index={1}>
                  <FaqAccordion items={c.items} />
                </Reveal>
              </section>
            ))}
          </div>
        </div>
      </Container>

      {/* Still have questions CTA */}
      <Container className="mt-20">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface p-8 sm:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("ctaTitle")}
                </h2>
                <p className="mt-3 text-muted">{t("ctaText")}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/contact" className={buttonVariants("primary", "lg")}>
                  {t("ctaButton")}
                </Link>
                <a
                  href="tel:+998712000000"
                  className={buttonVariants("secondary", "lg")}
                >
                  {t("ctaPhone")}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
