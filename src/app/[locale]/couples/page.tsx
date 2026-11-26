import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import { shopflow } from "@/lib/shopflow";
import { ADULT_CATEGORY } from "@/lib/catalog/adult";
import { adultCopy } from "@/lib/content/adult";
import { CouplesView } from "@/components/adult/CouplesView";

export const revalidate = 3600;

async function adultProducts(locale: Locale) {
  return shopflow
    .getProducts({ locale, category: ADULT_CATEGORY, sort: "popular", pageSize: 60 })
    .then((r) => r.items)
    .catch(() => []);
}

/* Indexed once there is something to buy; until then the page stays out of search. */
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const products = await adultProducts(locale);
  return staticPageMetadata(locale, "couples", "/couples", { noindex: products.length === 0 });
}

export default async function CouplesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await adultProducts(locale);
  return <CouplesView copy={adultCopy(locale)} products={products} />;
}
