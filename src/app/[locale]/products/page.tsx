import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { ProductListParams } from "@/lib/shopflow/types";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopView } from "@/components/shop/ShopView";

export const revalidate = 300;

type Sort = NonNullable<ProductListParams["sort"]>;
const valid: Sort[] = ["popular", "price_asc", "price_desc", "new"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    locale,
    path: "/products",
    title: t("shopTitle"),
    description: t("shopDescription"),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale } = await params;
  const { sort } = await searchParams;
  setRequestLocale(locale);
  const activeSort = valid.includes(sort as Sort) ? (sort as Sort) : "popular";
  return <ShopView locale={locale} sort={activeSort} />;
}
