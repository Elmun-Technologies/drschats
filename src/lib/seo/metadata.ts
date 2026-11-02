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
  /** A sorted/filtered/paged variant: crawlable for its links, kept out of the index. */
  noindex?: boolean;
  /** An article's real publication date (ISO), for article:published_time. */
  publishedTime?: string;
}

/** The brand suffix every title carries once; titles from page-meta already name it. */
export function brandedTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
}

/** og:locale wants language_TERRITORY, not the bare route segment. */
const OG_LOCALE: Record<Locale, string> = { uz: "uz_UZ", ru: "ru_RU" };

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  noindex = false,
  publishedTime,
}: PageMetaArgs): Metadata {
  const url = absoluteUrl(`/${locale}${path === "/" ? "" : path}`);
  const full = brandedTitle(title);
  // Only the shared card has known dimensions; a product or article photo is whatever size it was uploaded.
  const ogImage = image
    ? { url: image, alt: full }
    : { url: absoluteUrl(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: full };

  return {
    // Absolute: the [locale] layout's "%s — Go Vita" template is for pages that write a bare title.
    title: { absolute: full },
    description,
    /*
      A noindex variant names no canonical and no alternates: "do not index
      me" next to "the real page is X" is two instructions, and hreflang on a
      page that is not indexed is never reciprocated.
    */
    ...(noindex ? {} : { alternates: buildAlternates(locale, path) }),
    openGraph: {
      title: full,
      description,
      siteName: SITE_NAME,
      url,
      type: type === "product" ? "website" : type,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [ogImage],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: [ogImage.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
