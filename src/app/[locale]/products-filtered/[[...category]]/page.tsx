import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { RawSearchParams } from "@/lib/search-params";
import { ShelfPage, shelfMetadata } from "@/components/shop/shelf-route";

/*
  Sorted, searched, paged and filtered catalogue URLs, rendered per request.
  Visitors never see this path: middleware.ts rewrites /products?… and
  /products/<category>?… here and sends a direct hit back to /products, so
  the clean shelves above stay static.
*/

type Params = Promise<{ locale: Locale; category?: string[] }>;

function shelfOf(category: string[] | undefined): string | undefined {
  if (category && category.length > 1) notFound();
  return category?.[0];
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Promise<RawSearchParams> }): Promise<Metadata> {
  const [{ locale, category }, query] = await Promise.all([params, searchParams]);
  if (category && category.length > 1) return {};
  return shelfMetadata(locale, category?.[0], query);
}

export default async function FilteredShelfPage({ params, searchParams }: { params: Params; searchParams: Promise<RawSearchParams> }) {
  const [{ locale, category }, query] = await Promise.all([params, searchParams]);
  return <ShelfPage locale={locale} category={shelfOf(category)} query={query} />;
}
