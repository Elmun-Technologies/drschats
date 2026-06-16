import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Alimkhanov";

/**
 * Build canonical + hreflang alternates for a localized page so search engines
 * index every language correctly.
 *
 * @param path path WITHOUT the locale prefix, e.g. "/product/omega-3-premium"
 */
export function buildAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}${clean}`;
  }
  languages["x-default"] = `${SITE_URL}/${locales[0]}${clean}`;
  return {
    canonical: `${SITE_URL}/${locale}${clean}`,
    languages,
  };
}

interface PageMetaArgs {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: PageMetaArgs): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
      type: "website",
      locale,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
