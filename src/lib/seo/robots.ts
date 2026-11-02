import { SITE_URL } from "./metadata";

/*
  robots.txt as text, because MetadataRoute.Robots has no way to say
  Clean-param. The User-Agent/Allow/Disallow/Sitemap lines are the ones the
  old src/app/robots.ts produced through Next, byte for byte.

  Clean-param is Yandex's own directive (Google ignores it): ad and analytics
  markers do not change a page, so Yandex folds `?utm_source=…`, `?yclid=…`
  into the clean URL instead of crawling every campaign link as a duplicate.
  It is intersectional, so it may sit in the `*` group.
*/
export const DISALLOW = ["/*/cart", "/*/checkout", "/*/stop/", "/studio", "/admin", "/r/", "/s/"] as const;

export const YANDEX_CLEAN_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "yclid", "fbclid", "ttclid",
] as const;

export function robotsTxt(siteUrl: string = SITE_URL): string {
  return [
    "User-Agent: *",
    "Allow: /",
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    `Clean-param: ${YANDEX_CLEAN_PARAMS.join("&")}`,
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
