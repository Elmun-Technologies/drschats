/**
 * Sanity-backed programs, with the static seed as fallback — same shape as the
 * ingredients / experts / blog / health-topic content layers.
 */

import type { Locale } from "@/lib/i18n/routing";
import { client } from "@/sanity/client";
import {
  allProgramsQuery,
  programBySlugQuery,
  programSlugsQuery,
} from "@/sanity/queries/programs";
import type { Program } from "./programs";

export type { Program, ProgramStep, ProgramFaq } from "./programs";

const isSanityConfigured = () => !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const CACHE = { next: { tags: ["sanity"], revalidate: 3600 } };

export async function getPrograms(locale: Locale): Promise<Program[]> {
  if (!isSanityConfigured()) {
    const { getPrograms: getStatic } = await import("./programs");
    return getStatic(locale);
  }
  try {
    return ((await client.fetch(allProgramsQuery, { locale }, CACHE)) ?? []) as Program[];
  } catch (error) {
    console.error("[programs] list failed:", error);
    return [];
  }
}

export async function getProgram(slug: string, locale: Locale): Promise<Program | null> {
  if (!isSanityConfigured()) {
    const { getProgram: getStatic } = await import("./programs");
    return getStatic(slug, locale);
  }
  try {
    return ((await client.fetch(programBySlugQuery, { locale, slug }, CACHE)) ?? null) as Program | null;
  } catch (error) {
    console.error("[programs] detail failed:", error);
    return null;
  }
}

export async function getProgramSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) {
    const { getProgramSlugs: getStatic } = await import("./programs");
    return getStatic();
  }
  try {
    return ((await client.fetch(programSlugsQuery, {}, CACHE)) ?? []) as string[];
  } catch (error) {
    console.error("[programs] slugs failed:", error);
    return [];
  }
}
