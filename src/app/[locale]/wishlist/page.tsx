import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return buildPageMetadata({
    locale,
    path: "/wishlist",
    title: `${t("pageTitle")} — Alimkhanov`,
    description: t("pageSubtitle"),
  });
}

export default async function WishlistPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");
  const { items } = await shopflow.getProducts({ locale, pageSize: 100 });

  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/wishlist` }])} />
      <PageHero
        crumb={t("crumb")}
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />
      <WishlistView allProducts={items} />
    </div>
  );
}
