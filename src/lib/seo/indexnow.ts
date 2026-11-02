import { locales } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/config/site";

/*
  IndexNow (Bing, Yandex, Seznam, Naver …): one POST tells the engines a URL
  changed, instead of waiting for the next crawl to notice a price or a
  product back in stock. Off unless INDEXNOW_KEY is set — set it on the live
  deploy only, since the URLs announced are always SITE_URL's.

  The key is proven by a text file on the same host; it is served at
  /indexnow-key.txt (src/app/indexnow-key.txt/route.ts) and named in
  `keyLocation`, so it need not sit at the root under its own name.
*/

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

/** 8–128 characters of a-z, A-Z, 0-9 and "-", as the protocol requires; anything else is treated as unset. */
export function indexNowKey(env: Record<string, string | undefined> = process.env): string | null {
  const key = env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

/** Every language version of a page, as absolute URLs on the canonical host. */
export function localizedUrls(path: string, siteUrl: string = SITE_URL): string[] {
  return locales.map((l) => `${siteUrl}/${l}${path}`);
}

export function indexNowBody(key: string, urls: string[], siteUrl: string = SITE_URL) {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}${INDEXNOW_KEY_PATH}`,
    urlList: [...new Set(urls)].slice(0, 10_000),
  };
}

/** Never throws and never waits more than a few seconds: a missed ping only means the next crawl finds the change. */
export async function pingIndexNow(paths: string[], fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const key = indexNowKey();
  if (!key || paths.length === 0) return false;
  try {
    const res = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowBody(key, paths.flatMap((p) => localizedUrls(p)))),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok && res.status !== 202) console.warn(`[indexnow] ping answered ${res.status}`);
    return res.ok;
  } catch (err) {
    console.warn("[indexnow] ping failed:", (err as Error).message);
    return false;
  }
}
