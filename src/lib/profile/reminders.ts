import type { HealthProfile, HouseholdMember } from "./types";
import { ageOn, parseBirthday } from "./types";

/*
  When to reach out, decided in one place.

  Every channel — the card on /profile, the email cron, the Telegram bot —
  asks this module the same question and gets the same answer. The rules are
  pure and take `now` as an argument, so a birthday greeting that fires a day
  early is a failing test rather than a customer complaint.

  Each reminder carries an `id` that is stable for its occurrence
  (`birthday:self:2026`). That is what stops the same greeting going out twice
  when a cron runs hourly, and it is the key the backend stores in its sent log.
*/

export type ReminderKind =
  | "birthday"
  | "child-season"
  | "reorder"
  | "quiz-refresh";

export interface Reminder {
  id: string;
  kind: ReminderKind;
  /** Days from `now` until the reminder's date. 0 = today. */
  daysUntil: number;
  /** Household member the reminder is about; absent means the account holder. */
  memberId?: string;
  memberName?: string;
  relation?: HouseholdMember["relation"];
  /** Age being turned, when the birth year is known. */
  age?: number;
  /** Product the reminder is about — reorder only. */
  productSlug?: string;
  productName?: string;
}

export interface PurchaseEvent {
  slug: string;
  name?: string;
  ts: number;
}

export interface ReminderContext {
  profile: HealthProfile;
  purchases?: PurchaseEvent[];
  /** Unix ms the quiz plan was saved, if there is one. */
  quizSavedAt?: number;
  now: Date;
}

/** A greeting is worth nothing on the day itself if it needs a delivery. */
export const BIRTHDAY_LEAD_DAYS = 7;

/**
 * Most packs on the shelf are a 30-day course. Nudging a few days before it
 * runs out is a reminder; nudging after it has is an apology.
 */
export const COURSE_DAYS = 30;
const REORDER_LEAD_DAYS = 5;
/** Stop chasing a purchase nobody came back for. */
const REORDER_WINDOW_DAYS = 120;

/** Matches the quiz's own 90-day TTL — a stale plan is a plan for someone else. */
const QUIZ_STALE_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Whole days from `now` to the next occurrence of month/day. Never negative. */
export function daysUntilAnniversary(month: number, day: number, now: Date): number {
  const today = startOfUtcDay(now);
  const thisYear = Date.UTC(now.getUTCFullYear(), month - 1, day);
  const target = thisYear >= today ? thisYear : Date.UTC(now.getUTCFullYear() + 1, month - 1, day);
  return Math.round((target - today) / DAY_MS);
}

/** The calendar year the next occurrence falls in — part of the reminder id. */
function anniversaryYear(month: number, day: number, now: Date): number {
  const today = startOfUtcDay(now);
  const thisYear = Date.UTC(now.getUTCFullYear(), month - 1, day);
  return thisYear >= today ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
}

function birthdayReminder(
  birthday: string | undefined,
  now: Date,
  member?: HouseholdMember,
): Reminder | null {
  const parsed = parseBirthday(birthday);
  if (!parsed) return null;

  const daysUntil = daysUntilAnniversary(parsed.month, parsed.day, now);
  if (daysUntil > BIRTHDAY_LEAD_DAYS) return null;

  const year = anniversaryYear(parsed.month, parsed.day, now);
  // Age *after* the coming birthday, which is the one being celebrated.
  const currentAge = ageOn(birthday, now);
  const turning = currentAge === null ? undefined : currentAge + (daysUntil === 0 ? 0 : 1);

  return {
    id: `birthday:${member?.id ?? "self"}:${year}`,
    kind: "birthday",
    daysUntil,
    memberId: member?.id,
    memberName: member?.name,
    relation: member?.relation,
    age: turning,
  };
}

/*
  The school-year window.

  A parent who told us they have a child should hear from us once a year, when
  it is actually useful — the weeks before classes start, which in Uzbekistan
  is 2 September. Twice a year would be marketing; once, timed to something
  real in the family's calendar, is a service.
*/
const SCHOOL_SEASON_START = { month: 8, day: 10 };
const SCHOOL_SEASON_END = { month: 9, day: 10 };
/** Below this a child is not in school yet and the message would not apply. */
const SCHOOL_MIN_AGE = 5;
const SCHOOL_MAX_AGE = 17;

function inSchoolSeason(now: Date): boolean {
  const md = (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  return (
    md >= SCHOOL_SEASON_START.month * 100 + SCHOOL_SEASON_START.day &&
    md <= SCHOOL_SEASON_END.month * 100 + SCHOOL_SEASON_END.day
  );
}

function childSeasonReminders(profile: HealthProfile, now: Date): Reminder[] {
  if (!inSchoolSeason(now)) return [];

  return profile.household
    .filter((m) => m.relation === "child")
    .map((child): Reminder | null => {
      const age = ageOn(child.birthday, now);
      // An unknown age is not a reason to stay silent — a parent who told us
      // they have a child asked to be reminded about that child.
      if (age !== null && (age < SCHOOL_MIN_AGE || age > SCHOOL_MAX_AGE)) return null;
      return {
        id: `child-season:${child.id}:${now.getUTCFullYear()}`,
        kind: "child-season",
        daysUntil: daysUntilAnniversary(SCHOOL_SEASON_END.month, SCHOOL_SEASON_END.day, now),
        memberId: child.id,
        memberName: child.name,
        relation: child.relation,
        age: age ?? undefined,
      };
    })
    .filter((r): r is Reminder => r !== null);
}

function reorderReminders(purchases: PurchaseEvent[], now: Date): Reminder[] {
  const today = startOfUtcDay(now);
  // Only the most recent purchase of each product matters: buying it again
  // restarts the course and cancels the older reminder.
  const latest = new Map<string, PurchaseEvent>();
  for (const p of purchases) {
    const seen = latest.get(p.slug);
    if (!seen || p.ts > seen.ts) latest.set(p.slug, p);
  }

  const out: Reminder[] = [];
  for (const [slug, { ts, name }] of latest) {
    const elapsedDays = Math.floor((today - startOfUtcDay(new Date(ts))) / DAY_MS);
    if (elapsedDays < COURSE_DAYS - REORDER_LEAD_DAYS) continue;
    if (elapsedDays > REORDER_WINDOW_DAYS) continue;
    const runsOutOn = new Date(ts + COURSE_DAYS * DAY_MS);
    out.push({
      id: `reorder:${slug}:${runsOutOn.getUTCFullYear()}-${String(runsOutOn.getUTCMonth() + 1).padStart(2, "0")}`,
      kind: "reorder",
      daysUntil: Math.max(0, COURSE_DAYS - elapsedDays),
      productSlug: slug,
      productName: name,
    });
  }
  return out;
}

/**
 * Everything worth saying to this person today, soonest first.
 *
 * Consent is *not* checked here. This answers "is there something to say";
 * whether it may be said over email or Telegram is the sender's decision, and
 * the in-app card needs no permission at all.
 */
export function dueReminders(ctx: ReminderContext): Reminder[] {
  const { profile, purchases = [], quizSavedAt, now } = ctx;
  const out: Reminder[] = [];

  const own = birthdayReminder(profile.birthday, now);
  if (own) out.push(own);

  for (const member of profile.household) {
    const reminder = birthdayReminder(member.birthday, now, member);
    if (reminder) out.push(reminder);
  }

  out.push(...childSeasonReminders(profile, now));
  out.push(...reorderReminders(purchases, now));

  if (quizSavedAt && startOfUtcDay(now) - quizSavedAt > QUIZ_STALE_DAYS * DAY_MS) {
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push({ id: `quiz-refresh:${month}`, kind: "quiz-refresh", daysUntil: 0 });
  }

  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}
