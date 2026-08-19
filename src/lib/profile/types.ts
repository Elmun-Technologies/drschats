/*
  The health profile: everything the visitor has *told us*, as opposed to
  everything we inferred from their clicks.

  Two profiles exist side by side and they are not the same thing:

  - `src/lib/personalization` watches behaviour — what was viewed, what was
    bought. It needs no consent and it is never shown back to the visitor.
  - this one holds volunteered facts — a name, a birthday, who else is in the
    household, which channels may be used to reach them. It is editable,
    deletable, and every field is visible on /profile.

  Keeping them apart is what makes the second one honest: a person can read
  and erase exactly what they typed, without losing the shop's basic sense of
  what they were browsing.
*/

/** Who a household entry is, relative to the account holder. */
export type Relation = "child" | "partner" | "parent" | "other";

export interface HouseholdMember {
  id: string;
  relation: Relation;
  name?: string;
  /**
   * `YYYY-MM-DD`, or `MM-DD` when the year is not known.
   *
   * The year is optional for adults (a birthday greeting does not need it) but
   * meaningful for a child, where age decides the dose and the format.
   */
  birthday?: string;
}

/**
 * Marketing channels, each opted into separately.
 *
 * `false` is not "not asked yet" — `consentUpdatedAt` carries that. A profile
 * that has never been touched has no timestamp, and nothing is ever sent
 * until one exists.
 */
export interface ChannelConsent {
  email: boolean;
  telegram: boolean;
}

export const EMPTY_CONSENT: ChannelConsent = { email: false, telegram: false };

export interface HealthProfile {
  v: 1;
  name?: string;
  email?: string;
  /** `YYYY-MM-DD` or `MM-DD`. */
  birthday?: string;
  household: HouseholdMember[];
  /**
   * Option ids from the consultant's "what bothers you" question, picked
   * directly on /profile. Kept as ids rather than as free text so the same
   * weights that drive the quiz drive the profile.
   */
  concerns: string[];
  /** Health topic slugs, strongest first — derived from concerns or the quiz. */
  goals: string[];
  /** Ingredient slugs, strongest first — same two sources. */
  focusIngredients: string[];
  consents: ChannelConsent;
  /** Unix ms of the last consent decision. Absent = never asked. */
  consentUpdatedAt?: number;
  /** Unix ms of the last edit, used to decide when to re-sync to the API. */
  updatedAt: number;
  /** Unix ms of the last successful push to the accounts API, when configured. */
  syncedAt?: number;
}

export function emptyProfile(): HealthProfile {
  return {
    v: 1,
    household: [],
    concerns: [],
    goals: [],
    focusIngredients: [],
    consents: { ...EMPTY_CONSENT },
    updatedAt: 0,
  };
}

/** True when the visitor has given us enough to personalise anything at all. */
export function hasSignal(profile: HealthProfile): boolean {
  return (
    profile.goals.length > 0 ||
    profile.focusIngredients.length > 0 ||
    profile.household.length > 0 ||
    Boolean(profile.birthday)
  );
}

export interface ParsedBirthday {
  month: number;
  day: number;
  year?: number;
}

/**
 * Accepts `YYYY-MM-DD` and `MM-DD`. Returns null for anything else, including
 * the impossible dates a free-text field will eventually receive.
 */
export function parseBirthday(value: string | undefined): ParsedBirthday | null {
  if (!value) return null;
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const short = /^(\d{2})-(\d{2})$/.exec(value);

  let year: number | undefined;
  let month: number;
  let day: number;

  if (full) {
    year = Number(full[1]);
    month = Number(full[2]);
    day = Number(full[3]);
  } else if (short) {
    month = Number(short[1]);
    day = Number(short[2]);
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year !== undefined && (year < 1900 || year > new Date().getUTCFullYear())) return null;
  return { month, day, year };
}

/** Age in whole years on `on`, or null when the birth year is unknown. */
export function ageOn(birthday: string | undefined, on: Date): number | null {
  const parsed = parseBirthday(birthday);
  if (!parsed?.year) return null;
  let age = on.getUTCFullYear() - parsed.year;
  const beforeBirthday =
    on.getUTCMonth() + 1 < parsed.month ||
    (on.getUTCMonth() + 1 === parsed.month && on.getUTCDate() < parsed.day);
  if (beforeBirthday) age -= 1;
  return age < 0 ? null : age;
}
