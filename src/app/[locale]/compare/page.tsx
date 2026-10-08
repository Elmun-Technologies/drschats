import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CompareView } from "@/components/compare/CompareView";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop.compare" });
  // One visitor's picks are not a search result.
  return { ...buildPageMetadata({ locale, path: "/compare", title: `${t("title")} — Go Vita`, description: t("note") }), robots: { index: false, follow: true } };
}

export default async function ComparePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The picks live in the visitor's browser, so the page ships a pool and the
  // client resolves its own — the same trade-off as the wishlist.
  const pool = await shopflow.getProducts({ locale, pageSize: 100 });
  return <CompareView allProducts={pool.items} />;
}
