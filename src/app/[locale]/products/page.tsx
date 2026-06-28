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

const toNum = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ sort?: string; q?: string; origin?: string; min?: string; max?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { sort, q, origin, min, max, page } = await searchParams;
  setRequestLocale(locale);
  const activeSort = valid.includes(sort as Sort) ? (sort as Sort) : "popular";
  const activePage = Math.max(1, Number(page) || 1);
  return (
    <ShopView
      locale={locale}
      sort={activeSort}
      search={q?.trim() || undefined}
      origin={origin || undefined}
      minPrice={toNum(min)}
      maxPrice={toNum(max)}
      page={activePage}
    />
  );
}
