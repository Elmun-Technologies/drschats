import { describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n/routing";
import { getHealthTopics } from "./health-topics";
import { getIngredients, getSynergy } from "./ingredients";
import { BANNED_CLAIMS } from "./claims";

/*
  These are food supplements, not medicines. Copy may say a nutrient supports
  or contributes to a normal body function; it may not say it treats, prevents,
  protects against or shortens a disease, or that it works fast or is proven.
  Every string on /goals, /symptoms, /vitamins and /ingredients is walked.
*/

const BANNED = BANNED_CLAIMS;

function strings(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) strings(v, `${path}.${k}`, out);
  return out;
}

const copy = locales.flatMap((locale) => [
  ...strings(getHealthTopics(locale), `topics.${locale}`),
  ...strings(getIngredients(locale), `ingredients.${locale}`),
  ...strings(getSynergy(locale), `synergy.${locale}`),
]);

describe("health copy", () => {
  it("covers both languages", () => {
    expect(copy.some(([p]) => p.startsWith("topics.uz"))).toBe(true);
    expect(copy.some(([p]) => p.startsWith("topics.ru"))).toBe(true);
  });

  it("makes no medical promise", () => {
    const hits = copy.flatMap(([path, text]) =>
      BANNED.filter((re) => re.test(text)).map((re) => `${path}: ${re.source} — ${text}`),
    );
    expect(hits).toEqual([]);
  });

  it("writes Uzbek oʻ/gʻ with U+02BB, not an ASCII or curly apostrophe", () => {
    const hits = copy.filter(([path, text]) => path.includes(".uz") && /[og]['‘’]/i.test(text));
    expect(hits).toEqual([]);
  });
});
