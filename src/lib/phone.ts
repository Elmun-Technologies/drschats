/*
  Uzbek phone numbers: country code 998 and nine digits. The checkout used to
  accept any seven digits, so a mistyped number reached the operator as an
  order nobody could call back. One rule here, read by the form and by the
  server action.
*/
const ALLOWED = /^\+?[\d\s()-]+$/;

/** "+998901234567" for any common way of writing an Uzbek number, otherwise null. */
export function normalizeUzPhone(raw: string): string | null {
  const value = raw.trim();
  if (!ALLOWED.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("998") ? digits.slice(3) : digits.length === 9 ? digits : null;
  if (!local || local.startsWith("0")) return null;
  return `+998${local}`;
}

/** "+998 90 123 45 67" — how the number is shown back to the customer. */
export function formatUzPhone(normalized: string): string {
  const d = normalized.replace(/\D/g, "").slice(-9);
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
}
