import { yandexFeed } from "@/lib/seo/feeds";
import { FEED_CACHE, feedCatalogue, feedLocale } from "@/lib/seo/feed-source";

// Read per request like the sitemap: the Docker build has no database, so a prerendered feed would list the built-in catalogue forever.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Yandex serves mostly Russian-language queries; `?lang=uz` gives the Uzbek feed.
  const locale = feedLocale(request, "ru");
  const { products, categories } = await feedCatalogue(locale);
  return new Response(yandexFeed({ products, categories, locale }), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": FEED_CACHE },
  });
}
