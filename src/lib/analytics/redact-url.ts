/*
  Query parameters that identify a person: a signed email token carries the
  address in its payload, and the others are the address or number itself.
  None of them belongs in a third-party analytics panel.
*/
const PII_PARAMS = ["token", "email", "phone"];

/** `pathname + search` with personal query parameters removed. */
export function redactUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  for (const key of PII_PARAMS) params.delete(key);
  const rest = params.toString();
  return rest ? `${pathname}?${rest}` : pathname;
}
