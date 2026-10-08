import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
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
}: {
  params: Promise<{ locale: Locale; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const categories = await shopflow.getCategories(locale);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  return buildPageMetadata({
    locale,
    path: `/products/${category}`,
    title: `${cat.name} — Go Vita`,
    description: cat.description ?? cat.name,
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
  if (!categories.some((c) => c.slug === category)) notFound();

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

