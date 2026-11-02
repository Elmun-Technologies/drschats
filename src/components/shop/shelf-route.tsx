import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { listingMetadata, pagedTitle } from "@/lib/seo/page-meta";
import { getAllProducts } from "@/lib/shop/all-products";
import { isStocked } from "@/lib/shop/categories";
import { isCatalogSort } from "@/lib/shop/catalog-sort";
import { parseFilters, type FilterParams } from "@/lib/shop/catalog-filters";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { CATALOG_VARIANT_PARAMS, isVariantQuery, plainPageNumber } from "@/lib/seo/query-params";
import { ShopView } from "@/components/shop/ShopView";

/*
  /products and /products/[category] answer in two ways (see middleware.ts):
  the clean URL — and one that only carries ad or referral markers — is a
  static page rebuilt every few minutes; a URL with sort, search, page or a
  filter is rewritten to /[locale]/products-filtered/… and rendered per
  request. Both routes draw the same view through these two functions.
*/

type ShelfQuery = FilterParams & { sort?: string | string[]; q?: string | string[]; page?: string | string[] };

export async function shelfMetadata(locale: Locale, category: string | undefined, query: RawSearchParams = {}): Promise<Metadata> {
  const filtered = isVariantQuery(query, CATALOG_VARIANT_PARAMS);
  // A plain ?page=N is indexable with its own canonical; any other variant is noindex.
  const page = plainPageNumber(query, CATALOG_VARIANT_PARAMS);
  if (!category) {
    const t = await getTranslations({ locale, namespace: "meta" });
    return buildPageMetadata({
      locale,
      path: page ? `/products?page=${page}` : "/products",
      title: await pagedTitle(locale, t("shopTitle"), page),
      description: t("shopDescription"),
      noindex: !page && filtered,
    });
  }
  const categories = await shopflow.getCategories(locale);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  const products = await getAllProducts({ locale, category });
  return listingMetadata({
    locale,
    kind: "category",
    name: cat.name,
    path: `/products/${category}`,
    products: products.items,
    fallbackDescription: cat.description ?? cat.name,
    filtered,
    page,
  });
}

export async function ShelfPage({ locale, category, query = {} }: { locale: Locale; category?: string; query?: ShelfQuery }) {
  setRequestLocale(locale);
  if (category) {
    const categories = await shopflow.getCategories(locale);
    // An empty shelf answers 404 like a brand without products: nothing to show, nothing to index.
    const shelf = categories.find((c) => c.slug === category);
    if (!shelf || !isStocked(shelf)) notFound();
  }

  const { sort, q, page, ...rest } = query;
  const sortValue = firstParam(sort);
  const activeSort = isCatalogSort(sortValue) ? sortValue : "popular";
  const activePage = Math.max(1, Number(firstParam(page)) || 1);
  return (
    <ShopView
      locale={locale}
      activeCategory={category}
      sort={activeSort}
      search={firstParam(q)?.trim() || undefined}
      filters={parseFilters(rest)}
      page={activePage}
    />
  );
}
