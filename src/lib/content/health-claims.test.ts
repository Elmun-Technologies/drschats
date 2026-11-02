import { describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n/routing";
import { getHealthTopics } from "./health-topics";
import { getIngredients, getSynergy } from "./ingredients";

/*
  These are food supplements, not medicines. Copy may say a nutrient supports
  or contributes to a normal body function; it may not say it treats, prevents,
  protects against or shortens a disease, or that it works fast or is proven.
  Every string on /goals, /symptoms, /vitamins and /ingredients is walked.
*/

const NOT_LETTER = "(?<![\\p{L}\\u02BB\\u02BC])";
const word = (stem: string) => new RegExp(`${NOT_LETTER}${stem}`, "iu");

const BANNED: RegExp[] = [
  word("davola"),
  word("profilakti"),
  word("isbotlan"),
  word("tezkor"),
  word("tiklaydi"),
  word("oldini\\s+ol"),
  /viruslarga\s+qarshi/iu,
  /qarshi\s+kurash/iu,
  /(?:xavotir|stress|yallig[ʻ'‘’]lanish)ni\s+kamaytir/iu,
  /100% natija/iu,
  word("лечит"),
  word("лечени[еяю]"),
  word("излечива"),
  word("вылечи"),
  word("предотвра"),
  word("блокиру"),
  word("профилакти"),
  word("доказан"),
  word("восстанавлива"),
  word("против\\s"),
  /снижает\s+продолжительность/iu,
  word("борьб"),
];

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
