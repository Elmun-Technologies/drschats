/*
  Same-day order cut-off for Tashkent ("16:00", Tashkent time). The value is
  the admin's (/admin/commerce → Yetkazish, read at request time); the deploy
  env NEXT_PUBLIC_DELIVERY_CUTOFF is only its default (lib/commerce/settings.ts).
  Empty — no cut-off timer anywhere: the promise it makes ("order before …
  and it arrives tomorrow") is the operator's to give, not the code's to invent.
*/
const TASHKENT_OFFSET_MIN = 5 * 60;

export function parseCutoff(raw: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

/** Milliseconds left before today's cut-off in Tashkent, or null once it has passed. */
export function msUntilCutoff(cutoff: { hour: number; minute: number }, now: Date): number | null {
  const tashkentMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + TASHKENT_OFFSET_MIN) % (24 * 60);
  const left = (cutoff.hour * 60 + cutoff.minute - tashkentMinutes) * 60_000 - now.getUTCSeconds() * 1000;
  return left > 0 ? left : null;
}

export function formatCutoff(cutoff: { hour: number; minute: number }): string {
  return `${String(cutoff.hour).padStart(2, "0")}:${String(cutoff.minute).padStart(2, "0")}`;
}
