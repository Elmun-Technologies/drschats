/** An Uzbek mobile number as 998XXXXXXXXX, or null when it is not one. */
export function normalizeUzPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const full = digits.length === 9 ? `998${digits}` : digits;
  return /^998\d{9}$/.test(full) ? full : null;
}

/**
 * The last nine digits — how orders are matched to a customer. The order form
 * accepts "+998 90 …", "90 …" and "8 90 …" alike (ordersFromPhone does the same).
 */
export function phoneTail(raw: string): string {
  return raw.replace(/\D/g, "").slice(-9);
}
