/**
 * Sanity-backed blog content layer.
 * Falls back to static data when NEXT_PUBLIC_SANITY_PROJECT_ID is not set.
 * Public API is identical to blog.ts so all callers work unchanged.
 */

import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { allArticlesQuery, articleBySlugQuery, allArticleSlugsQuery } from "@/sanity/queries/blog";

export interface Article {
  slug: string;
  date: string;
  readingMinutes: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  sections: { heading: string; paragraphs: string[] }[];
  relatedProductSlugs: string[];
}

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

function mapImage(raw: { mainImage?: unknown }): string {
  if (raw.mainImage) {
    try {
      return urlFor(raw.mainImage).width(800).height(450).url();
    } catch {
      // fall through to placeholder
    }
  }
  return "/placeholders/p1.svg";
}

type SanityRaw = any;

function mapArticle(raw: SanityRaw): Article {
  const sections: { heading: string; paragraphs: string[] }[] = ((raw.sections ?? []) as SanityRaw[]).map(
    (s: SanityRaw) => ({
      heading: (s.heading ?? "") as string,
      paragraphs: Array.isArray(s.body)
        ? (s.body as { children?: { text?: string }[] }[]).flatMap((block) =>
            (block.children ?? []).map((c) => c.text ?? "").filter(Boolean)
          )
        : [],
    })
  );

  return {
    slug: raw.slug as string,
    date: (raw.date ?? "") as string,
    readingMinutes: (raw.readingMinutes ?? 5) as number,
    image: mapImage(raw),
    category: (raw.category ?? "") as string,
    title: (raw.title ?? "") as string,
    excerpt: (raw.excerpt ?? "") as string,
    sections,
    relatedProductSlugs: (raw.relatedProductSlugs ?? []) as string[],
  };
}

export async function getArticles(locale: Locale): Promise<Article[]> {
  if (!isSanityConfigured()) {
    const { getArticles: getStatic } = await import("./blog");
    return getStatic(locale);
  }
  const raw = await client.fetch(allArticlesQuery, { locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return (raw ?? []).map(mapArticle);
}

export async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  if (!isSanityConfigured()) {
    const { getArticle: getStatic } = await import("./blog");
    return getStatic(slug, locale);
  }
  const raw = await client.fetch(articleBySlugQuery, { slug, locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return raw ? mapArticle(raw) : null;
}

export async function listArticleSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) {
    const { listArticleSlugs: listStatic } = await import("./blog");
    return listStatic();
  }
  const raw = await client.fetch(allArticleSlugsQuery, {}, { next: { tags: ["sanity"], revalidate: 3600 } });
  return (raw ?? []).map((r: { slug: string }) => r.slug).filter(Boolean);
}
