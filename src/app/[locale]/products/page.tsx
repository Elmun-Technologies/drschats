import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopView } from "@/components/shop/ShopView";
import { isCatalogSort } from "@/lib/shop/catalog-sort";
import { parseFilters, type FilterParams } from "@/lib/shop/catalog-filters";

export const revalidate = 300;


export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    locale,
    path: "/products",
    title: t("shopTitle"),
    description: t("shopDescription"),
    noindex: Object.keys(query).length > 0,
  });
}


export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<FilterParams & { sort?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { sort, q, page, ...rest } = await searchParams;
  setRequestLocale(locale);
  const activeSort = isCatalogSort(sort) ? sort : "popular";
  const activePage = Math.max(1, Number(page) || 1);
  return (
    <ShopView
      locale={locale}
      sort={activeSort}
      search={q?.trim() || undefined}
      filters={parseFilters(rest)}
      page={activePage}
    />
  );
}
