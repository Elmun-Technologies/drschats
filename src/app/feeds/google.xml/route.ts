import { googleFeed } from "@/lib/seo/feeds";
import { FEED_CACHE, feedCatalogue, feedLocale } from "@/lib/seo/feed-source";

// Read per request like the sitemap: the Docker build has no database, so a prerendered feed would list the built-in catalogue forever.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = feedLocale(request, "uz");
  const { products, categories } = await feedCatalogue(locale);
  return new Response(googleFeed({ products, categories, locale }), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": FEED_CACHE },
  });
}
