/* Pure consent rule for advertising SMS (see consent.ts). */

/**
 * Whether an SMS may go out on consent grounds. Pure, so the rule is testable:
 * order SMS and messages the customer asked for need no general consent.
 */
export function smsConsentAllows(m: { kind: "marketing" | "transactional"; requested: boolean; phone9: string | null }, consents: Set<string>): boolean {
  if (m.kind === "transactional" || m.requested) return true;
  return Boolean(m.phone9) && consents.has(m.phone9!);
}
