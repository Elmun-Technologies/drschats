import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { CardGrid, type GridCard } from "@/components/page/CardGrid";
import { getBrands } from "@/lib/content/brands.sanity";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.brands" });
  return buildPageMetadata({ locale, path: "/brands", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.brands");

  const sanityBrands = await getBrands(locale as Locale);

  if (sanityBrands.length > 0) {
    return (
      <div className="pb-24">
        <JsonLd data={itemListLd(t("title"), sanityBrands.map((b) => ({ name: b.name, description: b.description })))} />
        <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/brands` }])} />
        <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <Container className="mt-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sanityBrands.map((brand, i) => (
              <Reveal key={brand.slug} index={i}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-ink p-6">
                  {brand.logo && (
                    <div className="relative h-16 w-full">
                      <Image src={brand.logo} alt={brand.name} fill className="object-contain object-left" sizes="200px" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-lg font-bold">{brand.name}</h2>
                    {brand.country && <p className="text-xs text-faint">{brand.country}</p>}
                    <p className="mt-2 text-sm text-muted">{brand.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  // Fallback to i18n data (no Sanity brands yet)
  const items = t.raw("items") as GridCard[];
  return (
    <div className="pb-24">
      <JsonLd data={itemListLd(t("title"), items.map((i) => ({ name: i.title, description: i.text })))} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/brands` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <CardGrid items={items} columns={3} withImage={false} />
    </div>
  );
}
