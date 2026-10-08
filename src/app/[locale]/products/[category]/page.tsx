import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { listingMetadata } from "@/lib/seo/page-meta";
import { getAllProducts } from "@/lib/shop/all-products";
import { isStocked } from "@/lib/shop/categories";
import { ShopView } from "@/components/shop/ShopView";
import { isCatalogSort } from "@/lib/shop/catalog-sort";
import { parseFilters, type FilterParams } from "@/lib/shop/catalog-filters";

export const revalidate = 300;
export const dynamicParams = true;


export async function generateStaticParams() {
  try {
    const categories = await shopflow.getCategories(routing.defaultLocale);
    return routing.locales.flatMap((locale) =>
      categories.map((c) => ({ locale, category: c.slug })),
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ locale, category }, query] = await Promise.all([params, searchParams]);
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
    filtered: Object.keys(query).length > 0,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<FilterParams & { sort?: string; q?: string; page?: string }>;
}) {
  const { locale, category } = await params;
  const { sort, q, page, ...rest } = await searchParams;
  setRequestLocale(locale);

  const categories = await shopflow.getCategories(locale);
  // An empty shelf answers 404 like a brand without products: nothing to show, nothing to index.
  const shelf = categories.find((c) => c.slug === category);
  if (!shelf || !isStocked(shelf)) notFound();

  const activeSort = isCatalogSort(sort) ? sort : "popular";
  const activePage = Math.max(1, Number(page) || 1);
  return (
    <ShopView
      locale={locale}
      activeCategory={category}
      sort={activeSort}
      search={q?.trim() || undefined}
      filters={parseFilters(rest)}
      page={activePage}
    />
  );
}

