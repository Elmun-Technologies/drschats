import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return {
    ...buildPageMetadata({
      locale,
      path: "/wishlist",
      title: `${t("title")} — ${SITE_NAME}`,
      description: t("metaDescription"),
    }),
    // One visitor's saved list is not a search result.
    robots: { index: false, follow: true },
  };
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The saved ids live in the visitor's browser, so the page ships a pool and
  // the client picks its own out of it. See WishlistView for the trade-off.
  const pool = await shopflow.getProducts({ locale, pageSize: 100 });

  return <WishlistView allProducts={pool.items} />;
}
