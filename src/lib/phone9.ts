/*
  The last nine digits of a phone number — how the shop matches one customer
  across orders, bot links, waitlist requests and the outbox, whatever format
  the number was typed in. One definition; the SQL twin is lib/db/phone.ts.
*/
export function phone9Of(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 9 ? digits.slice(-9) : null;
}
