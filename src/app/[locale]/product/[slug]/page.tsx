import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow, listAllSlugs } from "@/lib/shopflow";
import { routing } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, productGraph, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { reviewerForKey } from "@/lib/content/experts";
import { ProductTemplate } from "@/components/product/ProductTemplate";
import { getBespokeComponent } from "@/components/bespoke/registry";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  // Pre-render every product in every locale.
  return routing.locales.flatMap((locale) =>
    listAllSlugs().map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await shopflow.getProduct(slug, locale);
  if (!product) return {};
  return buildPageMetadata({
    locale,
    path: `/product/${slug}`,
    title: `${product.name} — Alimkhanov`,
    description: product.tagline,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await shopflow.getProduct(slug, locale);
  if (!product) notFound();

  const [upsells, t] = await Promise.all([
    shopflow.getUpsells(product.id, locale),
    getTranslations("product"),
  ]);

  const Bespoke = getBespokeComponent(slug);
  const reviewer = reviewerForKey(product.id, locale);
  const author = reviewerForKey(product.slug, locale);

  return (
    <>
      <JsonLd data={productGraph({ product, locale, reviewer, author })} />
      {product.faq.length > 0 && <JsonLd data={faqLd(product.faq)} />}
      <JsonLd
        data={breadcrumbLd([
          { name: t("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
          { name: product.categorySlug, url: `${SITE_URL}/${locale}/products/${product.categorySlug}` },
          { name: product.name, url: `${SITE_URL}/${locale}/product/${slug}` },
        ])}
      />
      {Bespoke ? (
        <Bespoke product={product} upsells={upsells} locale={locale} />
      ) : (
        <ProductTemplate product={product} upsells={upsells} locale={locale} />
      )}
    </>
  );
}
