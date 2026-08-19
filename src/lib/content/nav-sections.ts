import { getHealthTopicIndex } from "./health-topics.sanity";
import { TOPIC_BASE_PATH, TOPIC_KINDS } from "./health-topics";

/*
  Which health families are worth linking to yet.

  The whole site is arranged around goals, symptoms and vitamins, but the
  writing lands one family at a time — the text is medical, so it arrives when
  a pharmacist has signed it, not when the route exists. Until then "Vitamins"
  in the main menu is a promise the page cannot keep: the visitor clicks, gets
  an empty state, and learns that this menu is not to be trusted.

  So the menu is derived rather than declared. A family with no pages is not
  linked; the moment its first topic is published — in Sanity or in the static
  seed — it reappears on the next revalidate with no code change and nobody
  remembering to flip a switch. The routes themselves stay reachable, because a
  link that already exists somewhere should not start 404-ing.

  The bar is one page, not some editorial minimum. A section with a single
  well-written topic is thin; a section with none is broken. Only the second
  one is worth hiding from the menu.
*/
export async function populatedTopicPaths(): Promise<string[]> {
  const index = await getHealthTopicIndex().catch(() => []);
  const kinds = new Set(index.map((topic) => topic.kind));
  return TOPIC_KINDS.filter((kind) => kinds.has(kind)).map((kind) => TOPIC_BASE_PATH[kind]);
}

/** Every topic path, whether or not it currently has pages. */
export const ALL_TOPIC_PATHS: string[] = TOPIC_KINDS.map((kind) => TOPIC_BASE_PATH[kind]);

/**
 * True when `href` may be linked: anything that is not a topic family, plus the
 * topic families that have at least one page.
 */
export function isNavigable(href: string, populated: string[]): boolean {
  if (!ALL_TOPIC_PATHS.includes(href)) return true;
  return populated.includes(href);
}
