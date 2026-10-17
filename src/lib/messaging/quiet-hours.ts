/*
  Quiet hours: no marketing SMS or Telegram message between 21:00 and 09:00
  Tashkent time. A message due inside that window is deferred to 09:00, not
  dropped — the worker checks at the moment of sending, so a backlog that
  builds up at 20:59 does not go out at midnight either.

  Tashkent has been UTC+5 all year since 1992 (no daylight saving), so a fixed
  offset is exact.
*/

export const QUIET_START_HOUR = 21;
export const QUIET_END_HOUR = 9;
const OFFSET_MS = 5 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function tashkentHour(date: Date): number {
  return new Date(date.getTime() + OFFSET_MS).getUTCHours();
}

export function isQuietHours(date: Date): boolean {
  const hour = tashkentHour(date);
  return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;
}

/** `date` itself when sending is allowed then, otherwise the next 09:00 Tashkent. */
export function nextSendWindow(date: Date): Date {
  if (!isQuietHours(date)) return date;
  const local = new Date(date.getTime() + OFFSET_MS);
  const day = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const target = local.getUTCHours() >= QUIET_START_HOUR ? day + 24 * HOUR_MS : day;
  return new Date(target + QUIET_END_HOUR * HOUR_MS - OFFSET_MS);
}
