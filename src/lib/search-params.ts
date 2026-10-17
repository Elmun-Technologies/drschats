/*
  Next hands a repeated query parameter (`?q=a&q=b`) to the page as string[],
  whatever the page's type says. Reading it through here keeps `.trim()` and
  `.split()` from throwing and turning a crafted URL into a 500.
*/
export type SearchParamValue = string | string[] | undefined;

export type RawSearchParams = Record<string, SearchParamValue>;

export function firstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
