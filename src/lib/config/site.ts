/*
  Public site address — the single source for everything a crawler or a share
  card reads: canonical, hreflang, sitemap, robots and og:url / og:image.

  It has to be the production host in production. Every one of those tags was
  being emitted as `http://localhost:3000` because that was the fallback when
  NEXT_PUBLIC_SITE_URL was unset — which is exactly the state a preview
  deployment is in. Google then indexed the localhost URLs and every shared
  link pointed at a machine that does not exist for the reader.

  So the fallback is now the real domain. A misconfigured deployment produces
  correct SEO tags and a wrong preview link; the old behaviour produced broken
  canonical tags in production and looked fine locally.
*/

const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (RAW || "https://www.govita.uz").replace(/\/+$/, "");

/** Host used by next/image for remote patterns and by absolute URL builders. */
export const SITE_HOST = new URL(SITE_URL).host;

export const SITE_NAME = "Go Vita";

/**
 * Absolute URL for a path, for JSON-LD and og tags that must not be relative.
 */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
