/*
  Personal data, made safe to write into a log.

  Server logs outlive the request that wrote them, sit in a third-party
  dashboard, and are read by whoever is debugging at 2am — none of whom need
  the whole phone number to tell one request from another. A phone number and
  an email address are personal data under Uzbek law on personal data and under
  GDPR alike, and "it is only a log line" is how a shop ends up holding a
  searchable list of its customers' contacts somewhere nobody thought to
  protect.

  These keep enough to correlate a log line with a support conversation — the
  last digits are what a customer reads out over the phone — and drop the rest.

  They are deliberately total: any input, including garbage, returns something
  printable and never throws, because a redaction helper that can fail is a
  helper that gets wrapped in a try/catch and then skipped.
*/

/** "+998 90 123 45 67" -> "••• •• 67". Keeps the tail a customer would quote. */
export function redactPhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 0) return "(empty)";
  return `••• ${digits.slice(-2)}`;
}

/** "malika@example.com" -> "m••••@example.com". Keeps the domain, which is the useful half. */
export function redactEmail(email: string): string {
  const value = (email ?? "").trim();
  const at = value.lastIndexOf("@");
  if (at <= 0) return value ? "(malformed)" : "(empty)";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  return `${local[0]}${"•".repeat(Math.max(1, local.length - 1))}@${domain}`;
}
