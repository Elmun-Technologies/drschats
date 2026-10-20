/**
 * The number as the customer and the operator both say it: `GV-000123`.
 *
 * It used to be cut to its last eight characters for the success page, which
 * turned GV-000001 into "V-000001" — a different-looking order than the one
 * in the operator's Telegram message and in /admin/orders, so a customer
 * reading it out on the phone could not be found.
 */
export function displayOrderNumber(number: string | null | undefined): string | null {
  const value = number?.trim();
  if (!value) return null;
  return value.slice(0, 24);
}
