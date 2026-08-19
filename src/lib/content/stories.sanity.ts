import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { allStoriesQuery } from "@/sanity/queries/stories";

export type StoryKind = "video" | "case" | "transformation";

export interface CustomerStory {
  slug: string;
  kind: StoryKind;
  author: string;
  city?: string;
  rating?: number;
  date?: string;
  quote: string;
  body?: string;
  videoUrl?: string;
  beforeImage?: string;
  afterImage?: string;
  productSlugs: string[];
}

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

function toImage(raw: unknown): string | undefined {
  if (!raw) return undefined;
  try {
    return urlFor(raw).width(800).url();
  } catch {
    return undefined;
  }
}

/**
 * Customer stories live only in the CMS — the repository deliberately ships no
 * seed. Fabricated testimonials would be deceptive, and the page handles the
 * empty case on purpose.
 */
export async function getCustomerStories(locale: Locale): Promise<CustomerStory[]> {
  if (!isSanityConfigured()) return [];
  try {
    const raw = await client.fetch(
      allStoriesQuery,
      { locale },
      { next: { tags: ["sanity"], revalidate: 3600 } },
    );
    return ((raw ?? []) as Record<string, unknown>[]).map((story) => ({
      slug: String(story.slug ?? ""),
      kind: (story.kind as StoryKind) ?? "case",
      author: String(story.author ?? ""),
      city: (story.city as string) || undefined,
      rating: typeof story.rating === "number" ? story.rating : undefined,
      date: (story.date as string) || undefined,
      quote: String(story.quote ?? ""),
      body: (story.body as string) || undefined,
      videoUrl: (story.videoUrl as string) || undefined,
      beforeImage: toImage(story.beforeImage),
      afterImage: toImage(story.afterImage),
      productSlugs: Array.isArray(story.productSlugs) ? (story.productSlugs as string[]) : [],
    }));
  } catch (error) {
    console.error("[stories] fetch failed:", error);
    return [];
  }
}

/** youtube.com/watch?v=ID and youtu.be/ID → the privacy-enhanced embed URL. */
export function toYouTubeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    const id =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
