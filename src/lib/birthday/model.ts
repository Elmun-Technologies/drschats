/*
  Birthday dates — pure, `now` is an argument. Tashkent time (UTC+5, no DST).

  The flow trigger (lib/flows/triggers.ts) enrolls a customer once per year:
  cycle = the year of the birthday, anchor = midnight Tashkent `daysBefore`
  days before it, so the flow's step delays count from that moment.
  29 February is celebrated on 28 February in other years.
*/

const TZ_MS = 5 * 3_600_000;
const DAY_MS = 86_400_000;

export function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(month: number, year = 2024): number {
  return [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** A day/month a calendar can hold (29 February allowed: some years have it). */
export function validDayMonth(day: number, month: number): boolean {
  return Number.isInteger(day) && Number.isInteger(month) && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month, 2024);
}

/** Midnight Tashkent of this day/month in `year`, as a UTC instant. */
export function birthdayIn(year: number, day: number, month: number): Date {
  const d = month === 2 && day === 29 && !isLeap(year) ? 28 : day;
  return new Date(Date.UTC(year, month - 1, d) - TZ_MS);
}

/** The next occurrence at or after today's Tashkent midnight. */
export function nextBirthday(day: number, month: number, now: Date): { year: number; at: Date } {
  const local = new Date(now.getTime() + TZ_MS);
  const today = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - TZ_MS);
  const year = local.getUTCFullYear();
  const thisYear = birthdayIn(year, day, month);
  if (thisYear.getTime() >= today.getTime()) return { year, at: thisYear };
  return { year: year + 1, at: birthdayIn(year + 1, day, month) };
}

/** The flow's anchor for the next birthday: `daysBefore` days earlier. */
export function birthdayAnchor(day: number, month: number, daysBefore: number, now: Date): { cycle: string; anchor: Date; birthday: Date } {
  // Look from `daysBefore` days ahead, so a birthday inside the lead window still counts for this year.
  const next = nextBirthday(day, month, new Date(now.getTime() - daysBefore * DAY_MS));
  return { cycle: String(next.year), anchor: new Date(next.at.getTime() - daysBefore * DAY_MS), birthday: next.at };
}
