import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import type { ProductListParams } from "@/lib/shopflow/types";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopView } from "@/components/shop/ShopView";

export const revalidate = 300;
export const dynamicParams = true;

type Sort = NonNullable<ProductListParams["sort"]>;
const valid: Sort[] = ["popular", "price_asc", "price_desc", "new"];

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
    title: `${cat.name} — Alimkhanov`,
    description: cat.description ?? cat.name,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<{ sort?: string; q?: string; origin?: string; min?: string; max?: string; page?: string }>;
}) {
  const { locale, category } = await params;
  const { sort, q, origin, min, max, page } = await searchParams;
  setRequestLocale(locale);

  const categories = await shopflow.getCategories(locale);
  if (!categories.some((c) => c.slug === category)) notFound();

  const activeSort = valid.includes(sort as Sort) ? (sort as Sort) : "popular";
  const activePage = Math.max(1, Number(page) || 1);
  return (
    <ShopView
      locale={locale}
      activeCategory={category}
      sort={activeSort}
      search={q?.trim() || undefined}
      origin={origin || undefined}
      minPrice={toNum(min)}
      maxPrice={toNum(max)}
      page={activePage}
    />
  );
}

const toNum = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : undefined;
};
