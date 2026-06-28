import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { CardGrid, type GridCard } from "@/components/page/CardGrid";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return buildPageMetadata({ locale, path: "/about", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const stats = t.raw("stats") as { value: string; label: string }[];
  const values = t.raw("values") as GridCard[];

  return (
    <div className="pb-24">
      <JsonLd data={organizationLd()} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/about` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="pt-10">
        <Reveal>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <div className="rounded-2xl border border-line bg-surface p-6 text-center">
                <div className="font-display text-3xl font-extrabold text-accent-strong sm:text-4xl">{s.value}</div>
                <div className="mt-2 text-sm text-muted">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <CardGrid items={values} columns={3} withImage={false} />
    </div>
  );
}
