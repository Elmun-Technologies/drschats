/*
  How a customer types an order number back: "GV-000123", "gv 123", "123",
  "№ GV-000123". The database writes GV- and six digits (0001_init.sql).
  Pure — the tracking form's server action and its tests share it.
*/
export function normalizeOrderNumber(input: string): string | null {
  const value = input.trim().toUpperCase().replace(/^№\s*/, "");
  const digits = /^(?:GV)?[\s-]*0*(\d{1,10})$/.exec(value)?.[1];
  if (!digits) return null;
  return `GV-${digits.padStart(6, "0")}`;
}
