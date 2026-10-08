import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { ALL_BRANDS, productBrand, type ProductBrand } from "@/lib/content/product-brands";
import { getBrands } from "@/lib/content/brands.sanity";

export interface BrandInfo extends ProductBrand {
  country: string | null;
  text: string | null;
  products: Product[];
}

/*
  A brand as /brands and /brands/[slug] draw it: the name and slug from the
  product slugs (product-brands.ts), country and one-line description from
  Sanity when it has the brand, otherwise from the i18n fallback, and the
  products from the catalogue. A brand with no products still gets its tile —
  the import is real even when the shelf is empty.
*/
export async function getBrandInfos(locale: Locale, catalogue: Product[]): Promise<BrandInfo[]> {
  const [t, sanity] = await Promise.all([
    getTranslations({ locale, namespace: "pages.brands" }),
    getBrands(locale).catch(() => []),
  ]);
  const fallback = t.raw("items") as { title: string; text: string; meta: string }[];

  return ALL_BRANDS.map((b) => {
    const fromSanity = sanity.find((s) => s.name.toLowerCase() === b.name.toLowerCase());
    const fromI18n = fallback.find((i) => i.title.toLowerCase() === b.name.toLowerCase());
    return {
      ...b,
      country: fromSanity?.country ?? fromI18n?.meta ?? null,
      text: fromSanity?.description ?? fromI18n?.text ?? null,
      products: catalogue.filter((p) => productBrand(p.slug)?.slug === b.slug),
    };
  }).filter((b) => b.products.length > 0 || b.text);
}
