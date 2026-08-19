import { shopflow } from "@/lib/shopflow";
import { isLocale, routing } from "@/lib/i18n/routing";

/*
  Type-ahead for the header search.

  This is not a new backend capability: `getProducts({ search })` is already in
  the catalogue contract, and this route is the thin server-side caller that
  lets the browser use it without holding an API key. When the catalogue moves
  behind a real search engine, only this file changes.
*/
const MIN_QUERY = 2;
const LIMIT = 6;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : routing.defaultLocale;

  if (q.length < MIN_QUERY) return Response.json({ items: [] });

  try {
    const result = await shopflow.getProducts({ locale, search: q, pageSize: LIMIT });
    // Only what the dropdown draws — a suggestion list is not a place to ship
    // the full product record over the wire.
    const items = result.items.slice(0, LIMIT).map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.images[0]?.url ?? null,
    }));
    return Response.json(
      { items },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch {
    // A failing suggest must never break typing: the form still submits.
    return Response.json({ items: [] });
  }
}
