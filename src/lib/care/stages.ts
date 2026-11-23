/*
  Where a pregnancy or a child is today, worked out from one date the visitor
  typed. Nothing here is stored: the stage is recomputed on every render, so a
  corrected date corrects everything that depends on it. `now` is an argument,
  like lib/profile/reminders.ts, so the rules are testable at any date.
*/

const DAY = 24 * 60 * 60 * 1000;

/** Naegele: the due date sits 280 days after the first day of the last period. */
export const PREGNANCY_DAYS = 280;
export const PREGNANCY_WEEKS = 40;
/** Past this the tracker stops counting weeks and points to the child page. */
export const LAST_WEEK = 42;
export const CHILD_MAX_MONTHS = 36;

export type Trimester = 1 | 2 | 3;

/** "YYYY-MM-DD" from a date input, read at local noon so no time zone moves it a day. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d, 12);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/**
 * Pregnancy week (completed weeks, at least 1) on `now` for a due date, or null when the date
 * cannot be a current pregnancy (more than 42 weeks ago or not yet conceived).
 */
/** `now` moved to local noon, the hour dates are read at, so comparisons are by calendar day. */
function today(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export function weekFromDueDate(due: Date, now: Date): number | null {
  const lmp = due.getTime() - PREGNANCY_DAYS * DAY;
  const days = Math.round((today(now).getTime() - lmp) / DAY);
  if (days < 0) return null;
  // Completed weeks, as an obstetrician counts them: the due date is week 40.
  const week = Math.max(1, Math.floor(days / 7));
  return week > LAST_WEEK ? null : week;
}

export function trimesterOf(week: number): Trimester {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

/** Whole months of age on `now`, or null for a birth date in the future. */
export function ageInMonths(birth: Date, now: Date): number | null {
  if (birth.getTime() > today(now).getTime()) return null;
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

/** The child stages shown on /care/baby, as [from, to) in months. */
export const CHILD_STAGES = [
  { id: "m0", from: 0, to: 1 },
  { id: "m1", from: 1, to: 3 },
  { id: "m3", from: 3, to: 6 },
  { id: "m6", from: 6, to: 9 },
  { id: "m9", from: 9, to: 12 },
  { id: "y1", from: 12, to: 24 },
  { id: "y2", from: 24, to: 36 },
] as const;

export type ChildStageId = (typeof CHILD_STAGES)[number]["id"];

/** Index into CHILD_STAGES, or null once the child is past three. */
export function childStageIndex(months: number): number | null {
  if (months < 0) return null;
  const i = CHILD_STAGES.findIndex((s) => months >= s.from && months < s.to);
  return i === -1 ? null : i;
}
