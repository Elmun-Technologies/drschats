/**
 * Sanity-backed experts content layer.
 * Falls back to static data when NEXT_PUBLIC_SANITY_PROJECT_ID is not set.
 * Preserves reviewerForKey() deterministic assignment using the Sanity-fetched list.
 */

import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { allExpertsQuery, expertBySlugQuery, allExpertSlugsQuery } from "@/sanity/queries/experts";

export interface Expert {
  id: string;
  slug: string;
  name: string;
  image: string;
  title: string;
  bio: string;
  credentials: string[];
  worksFor: string;
  sameAs: string[];
}

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

type SR = any;

function mapExpert(raw: SR): Expert {
  let image = "/placeholders/p1.svg";
  if (raw.photo) {
    try {
      image = urlFor(raw.photo).width(400).height(400).url();
    } catch {
      // fall through to placeholder
    }
  }
  return {
    id: raw.id ?? raw.slug ?? "",
    slug: raw.slug ?? "",
    name: raw.name ?? "",
    image,
    title: raw.title ?? "",
    bio: raw.bio ?? "",
    credentials: Array.isArray(raw.credentials) ? raw.credentials : [],
    worksFor: raw.worksFor ?? "",
    sameAs: Array.isArray(raw.sameAs) ? raw.sameAs : [],
  };
}

let _expertsCache: Expert[] | null = null;

async function fetchAll(locale: Locale): Promise<Expert[]> {
  if (!isSanityConfigured()) {
    const { getExperts: getStatic } = await import("./experts");
    return getStatic(locale);
  }
  const raw = await client.fetch(allExpertsQuery, { locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  const experts = (raw ?? []).map(mapExpert);
  _expertsCache = experts;
  return experts;
}

export async function getExperts(locale: Locale): Promise<Expert[]> {
  return fetchAll(locale);
}

export async function getExpert(slug: string, locale: Locale): Promise<Expert | null> {
  if (!isSanityConfigured()) {
    const { getExpert: getStatic } = await import("./experts");
    return getStatic(slug, locale);
  }
  const raw = await client.fetch(expertBySlugQuery, { slug, locale }, { next: { tags: ["sanity"], revalidate: 3600 } });
  return raw ? mapExpert(raw) : null;
}

export async function getExpertById(id: string, locale: Locale): Promise<Expert | null> {
  const all = await fetchAll(locale);
  return all.find((e) => e.id === id) ?? null;
}

export async function listExpertSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) {
    const { listExpertSlugs: listStatic } = await import("./experts");
    return listStatic();
  }
  const raw = await client.fetch(allExpertSlugsQuery, {}, { next: { tags: ["sanity"], revalidate: 3600 } });
  return (raw ?? []).map((r: { slug: string }) => r.slug).filter(Boolean);
}

/** Deterministic reviewer assignment — same hash as the static version */
export async function reviewerForKey(key: string, locale: Locale): Promise<Expert> {
  if (!isSanityConfigured()) {
    const { reviewerForKey: staticFn } = await import("./experts");
    return staticFn(key, locale);
  }
  const all = await fetchAll(locale);
  if (!all.length) {
    const { reviewerForKey: staticFn } = await import("./experts");
    return staticFn(key, locale);
  }
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return all[h % all.length];
}
