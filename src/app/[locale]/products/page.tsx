import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopView } from "@/components/shop/ShopView";
import { isCatalogSort } from "@/lib/shop/catalog-sort";
import { parseFilters, type FilterParams } from "@/lib/shop/catalog-filters";
import { firstParam } from "@/lib/search-params";
import { CATALOG_VARIANT_PARAMS, isVariantQuery, plainPageNumber } from "@/lib/seo/query-params";
import { pagedTitle } from "@/lib/seo/page-meta";

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
  const page = plainPageNumber(query, CATALOG_VARIANT_PARAMS);
  return buildPageMetadata({
    locale,
    path: page ? `/products?page=${page}` : "/products",
    title: await pagedTitle(locale, t("shopTitle"), page),
    description: t("shopDescription"),
    noindex: !page && isVariantQuery(query, CATALOG_VARIANT_PARAMS),
  });
}


export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<FilterParams & { sort?: string | string[]; q?: string | string[]; page?: string | string[] }>;
}) {
  const { locale } = await params;
  const { sort, q, page, ...rest } = await searchParams;
  setRequestLocale(locale);
  const sortValue = firstParam(sort);
  const activeSort = isCatalogSort(sortValue) ? sortValue : "popular";
  const activePage = Math.max(1, Number(firstParam(page)) || 1);
  return (
    <ShopView
      locale={locale}
      sort={activeSort}
      search={firstParam(q)?.trim() || undefined}
      filters={parseFilters(rest)}
      page={activePage}
    />
  );
}
