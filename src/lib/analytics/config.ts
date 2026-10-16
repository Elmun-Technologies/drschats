export interface AnalyticsIds {
  gtm: string;
  ga4: string;
  metaPixel: string;
  yandexMetrika: string;
}

const PATTERNS: Record<keyof AnalyticsIds, RegExp> = {
  gtm: /^GTM-[A-Z0-9]+$/i,
  ga4: /^G-[A-Z0-9]+$/i,
  metaPixel: /^\d{5,20}$/,
  yandexMetrika: /^\d{1,20}$/,
};

/** Accept only provider IDs, never arbitrary script fragments or URLs. */
export function sanitizeAnalyticsIds(value: Partial<Record<keyof AnalyticsIds, unknown>>): AnalyticsIds {
  const clean = (key: keyof AnalyticsIds) => {
    const raw = typeof value[key] === "string" ? (value[key] as string).trim() : "";
    return PATTERNS[key].test(raw) ? raw : "";
  };
  return {
    gtm: clean("gtm"),
    ga4: clean("ga4"),
    metaPixel: clean("metaPixel"),
    yandexMetrika: clean("yandexMetrika"),
  };
}

/** Build-safe environment snapshot used as the first-paint fallback in the browser. */
export function analyticsIdsFromEnvironment(): AnalyticsIds {
  return sanitizeAnalyticsIds({
    gtm: process.env.NEXT_PUBLIC_GTM_ID,
    ga4: process.env.NEXT_PUBLIC_GA4_ID,
    metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    yandexMetrika: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
  });
}
