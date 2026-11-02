import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/routing";
import { ShelfPage, shelfMetadata } from "@/components/shop/shelf-route";

/* The clean catalogue URL; sorted, filtered and paged variants are rendered by products-filtered/ (middleware.ts). */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return shelfMetadata(locale, undefined);
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <ShelfPage locale={locale} />;
}
