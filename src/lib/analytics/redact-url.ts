/*
  Query parameters that identify a person: a signed email token carries the
  address in its payload, and the others are the address or number itself.
  None of them belongs in a third-party analytics panel.
*/
const PII_PARAMS = ["token", "email", "phone"];

/*
  Parameters that are personal only on one page: the quiz result URL carries
  the visitor's own answers (pregnancy, medicines, age), which is health data.
*/
const PAGE_PARAMS: ReadonlyArray<[RegExp, string]> = [[/\/quiz\/result\/?$/, "a"]];

/** `pathname + search` with personal query parameters removed. */
export function redactUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  for (const key of PII_PARAMS) params.delete(key);
  for (const [path, key] of PAGE_PARAMS) if (path.test(pathname)) params.delete(key);
  const rest = params.toString();
  return rest ? `${pathname}?${rest}` : pathname;
}
