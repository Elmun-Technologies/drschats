/**
 * Sanity-backed health topics.
 * Falls back to the static seed when NEXT_PUBLIC_SANITY_PROJECT_ID is not set,
 * mirroring the ingredients/experts/blog content layers.
 */

import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import {
  allHealthTopicsQuery,
  healthTopicBySlugQuery,
  healthTopicIndexQuery,
  healthTopicsByKindQuery,
} from "@/sanity/queries/healthTopics";
import type { HealthTopic, HealthTopicKind } from "./health-topics";

export type { HealthTopic, HealthTopicKind } from "./health-topics";
export { TOPIC_BASE_PATH, TOPIC_KINDS } from "./health-topics";

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const CACHE = { next: { tags: ["sanity"], revalidate: 3600 } };

export async function getHealthTopics(
  locale: Locale,
  kind?: HealthTopicKind,
): Promise<HealthTopic[]> {
  if (!isSanityConfigured()) {
    const { getHealthTopics: getStatic } = await import("./health-topics");
    return getStatic(locale, kind);
  }
  try {
    const raw = kind
      ? await client.fetch(healthTopicsByKindQuery, { locale, kind }, CACHE)
      : await client.fetch(allHealthTopicsQuery, { locale }, CACHE);
    return (raw ?? []) as HealthTopic[];
  } catch (error) {
    console.error("[health-topics] list failed:", error);
    return [];
  }
}

export async function getHealthTopic(
  slug: string,
  locale: Locale,
): Promise<HealthTopic | null> {
  if (!isSanityConfigured()) {
    const { getHealthTopic: getStatic } = await import("./health-topics");
    return getStatic(slug, locale);
  }
  try {
    const raw = await client.fetch(healthTopicBySlugQuery, { locale, slug }, CACHE);
    return (raw ?? null) as HealthTopic | null;
  } catch (error) {
    console.error("[health-topics] detail failed:", error);
    return null;
  }
}

export async function getHealthTopicIndex(): Promise<
  { kind: HealthTopicKind; slug: string }[]
> {
  if (!isSanityConfigured()) {
    const { getHealthTopicIndex: getStatic } = await import("./health-topics");
    return getStatic();
  }
  try {
    const raw = await client.fetch(healthTopicIndexQuery, {}, CACHE);
    return (raw ?? []) as { kind: HealthTopicKind; slug: string }[];
  } catch (error) {
    console.error("[health-topics] index failed:", error);
    return [];
  }
}
