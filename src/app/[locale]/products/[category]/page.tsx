import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { ShelfPage, shelfMetadata } from "@/components/shop/shelf-route";

/* The clean category URL; sorted, filtered and paged variants are rendered by products-filtered/ (middleware.ts). */
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

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  return shelfMetadata(locale, category);
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: Locale; category: string }> }) {
  const { locale, category } = await params;
  return <ShelfPage locale={locale} category={category} />;
}
