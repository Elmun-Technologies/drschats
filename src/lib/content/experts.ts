import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface RawExpert {
  id: string;
  slug: string;
  name: string;
  /**
   * Marks a record as a layout placeholder rather than a person.
   *
   * The client asked for the expert section to be filled with demo profiles
   * for the presentation, so the design can be seen with content in it. A demo
   * record is treated differently everywhere it matters:
   *
   *  - its title carries "(namuna profili)" / "(демо-профиль)", so no screen
   *    can show the name without the label;
   *  - the expert pages print a banner saying the record is a placeholder;
   *  - `reviewerForKey()` refuses to return one, so a demo profile can never
   *    be printed as the medical reviewer of a product or an article.
   *
   * Removing the flag and dropping in the real record is the whole upgrade
   * path — see docs/GOVITA-TAVSIYALAR.md §3.
   */
  demo?: boolean;
  /** Path in /public — the person's own photograph, with written consent on file. */
  photo?: string;
  photoSeed: string;
  title: L;
  bio: L;
  credentials: L<string[]>;
  worksFor: string;
  sameAs: string[];
}

export interface Expert {
  id: string;
  slug: string;
  name: string;
  /** Placeholder profile — see RawExpert.demo. */
  isDemo: boolean;
  image: string;
  title: string;
  bio: string;
  credentials: string[];
  worksFor: string;
  sameAs: string[];
}

const img = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `/placeholders/p${(h % 6) + 1}.svg`;
};

/*
  The review board is empty on purpose.

  This file used to ship three complete experts — "Dr. Jasur Alimov", "Dr.
  Nodira Karimova", "Dr. Bekzod Yusupov" — with invented credentials, an
  invented 15-year biography each, LinkedIn and PubMed profile URLs that
  belonged to nobody, and a generated portrait. `reviewerForKey()` then assigned
  one of them, deterministically, as the medical reviewer of every product and
  every article on the site, and the product page printed their name under
  "Tekshirilgan".

  That is a fabricated medical endorsement, attached to pages about how a
  person should take supplements, in a country where the advertising law
  (art. 35) is explicit about supplement claims. It also cannot be fixed by
  rewriting the copy — the whole point of the block is that a named, reachable
  professional stands behind the content.

  So the list is empty until real ones exist, and everything downstream already
  degrades to "no reviewer shown" (the components take an optional expert, and
  the JSON-LD omits reviewedBy/author rather than pointing at a stranger). The
  moment Sanity holds a real person — a real name, a real photo of them, a
  speciality, a place of work and their written consent — they appear here
  again, unchanged, by adding the record.

  See docs/GOVITA-TAVSIYALAR.md §Ekspertlar for exactly what each record needs.
*/
// Empty until a real, consenting specialist is on file. The demo profiles that
// filled the layout for the presentation (with generated portraits) are gone:
// the live shop shows no expert section at all rather than a placeholder one.
const rawExperts: RawExpert[] = [];

function resolve(e: RawExpert, locale: Locale): Expert {
  /*
    One photo per person, from one source.

    The old map held three portraits of people who had never worked here; it is
    gone. A record carries its own `photo` file name, so the same face appears
    on the expert page, in the product review block and in the article byline —
    which was the client's actual complaint: different photos of the same name
    in different places.
  */
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    isDemo: Boolean(e.demo),
    image: e.photo ?? img(e.photoSeed),
    title: e.title[locale],
    bio: e.bio[locale],
    credentials: e.credentials[locale],
    worksFor: e.worksFor,
    sameAs: e.sameAs,
  };
}

export function getExperts(locale: Locale): Expert[] {
  return rawExperts.map((e) => resolve(e, locale));
}

export function getExpert(slug: string, locale: Locale): Expert | null {
  const raw = rawExperts.find((e) => e.slug === slug);
  return raw ? resolve(raw, locale) : null;
}

export function getExpertById(id: string, locale: Locale): Expert | null {
  const raw = rawExperts.find((e) => e.id === id);
  return raw ? resolve(raw, locale) : null;
}

export function listExpertSlugs(): string[] {
  return rawExperts.map((e) => e.slug);
}

/**
 * The reviewer of a page, when there is a review board to draw from.
 *
 * Returns null while the board is empty so callers hide the block instead of
 * printing an empty name — see the comment above `rawExperts`.
 */
export function reviewerForKey(key: string, locale: Locale): Expert | null {
  // Demo profiles are excluded: a placeholder may show the shape of the
  // section, but it must never be printed as the person who checked a page
  // about how to take a supplement.
  const real = rawExperts.filter((e) => !e.demo);
  if (real.length === 0) return null;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return resolve(real[h % real.length], locale);
}
