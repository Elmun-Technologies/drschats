import { locales } from "@/lib/i18n/routing";
import type { RawSearchParams } from "@/lib/search-params";
import { CATALOG_VARIANT_PARAMS, isVariantQuery } from "@/lib/seo/query-params";

/*
  The catalogue's clean URLs are static pages; a query that changes what the
  shelf shows (sort, search, page, a filter) needs a per-request render. The
  middleware sends those to an internal route instead of making the clean
  shelf dynamic for everyone. Ad and referral markers do not count: an
  `?utm_source=` click still gets the static page.
*/
export const FILTERED_SEGMENT = "products-filtered";

const LOCALE = `(${locales.join("|")})`;
const SHELF = new RegExp(`^/${LOCALE}/products(/[^/]+)?/?$`);
const INTERNAL = new RegExp(`^/${LOCALE}/${FILTERED_SEGMENT}(/.*)?$`);

function queryOf(params: URLSearchParams): RawSearchParams {
  const out: RawSearchParams = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    out[key] = values.length > 1 ? values : values[0];
  }
  return out;
}

export type ShelfRoute =
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; pathname: string }
  | null;

/** What the middleware does with `pathname` + `search`: rewrite to the filtered route, send an internal path back, or nothing. */
export function shelfRoute(pathname: string, params: URLSearchParams): ShelfRoute {
  const internal = pathname.match(INTERNAL);
  if (internal) return { kind: "redirect", pathname: `/${internal[1]}/products${internal[2] ?? ""}` };
  const shelf = pathname.match(SHELF);
  if (!shelf || !isVariantQuery(queryOf(params), CATALOG_VARIANT_PARAMS)) return null;
  return { kind: "rewrite", pathname: `/${shelf[1]}/${FILTERED_SEGMENT}${shelf[2] ?? ""}` };
}
