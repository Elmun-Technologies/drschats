import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/routing";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/config/site";

export { SITE_URL, SITE_NAME };

/** Shared 1200×630 share card used whenever a page does not supply one. */
export const DEFAULT_OG_IMAGE = "/og/govita-og.jpg";

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
  /*
    x-default is the locale a visitor gets when none of the alternates match
    them, so it has to be the site's default locale — not whichever one happens
    to sort first in the `locales` array. Those are not the same thing: the
    array is ["ru", "uz"] while the default is "uz", and reading `locales[0]`
    pointed every x-default on the site at Russian.

    It also has to agree with sitemap.ts, which builds its own alternates from
    `defaultLocale`. Two sources disagreeing is worse than either being wrong
    on its own, because Google receives a contradiction rather than a mistake.
  */
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${clean}`;
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
  type?: "website" | "article" | "product";
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
}: PageMetaArgs): Metadata {
  const url = absoluteUrl(`/${locale}${path === "/" ? "" : path}`);
  const ogImage = image ? image : absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      url,
      type: type === "product" ? "website" : type,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
