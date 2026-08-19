import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { allBrandsQuery } from "@/sanity/queries/brands";

export interface Brand {
  slug: string;
  name: string;
  logo: string | null;
  country: string;
  description: string;
}

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

type SR = any;

function mapBrand(raw: SR): Brand {
  let logo: string | null = null;
  if (raw.logo) {
    try {
      logo = urlFor(raw.logo as SR).width(200).height(80).url();
    } catch {
      // no logo
    }
  }
  return {
    slug: (raw.slug ?? "") as string,
    name: (raw.name ?? "") as string,
    logo,
    country: (raw.country ?? "") as string,
    description: (raw.description ?? "") as string,
  };
}

export async function getBrands(locale: Locale): Promise<Brand[]> {
  if (!isSanityConfigured()) return [];
  const raw = await client.fetch(allBrandsQuery, { locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return (raw ?? []).map(mapBrand);
}
