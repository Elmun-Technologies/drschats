import { describe, expect, it } from "vitest";
import { BANNED_CLAIMS } from "@/lib/content/claims";
import { getHealthTopic } from "@/lib/content/health-topics";
import { rawProducts } from "@/lib/shopflow/mock";
import { locales } from "@/lib/i18n/routing";
import { BOX_SLUG, KIT_SLUGS, KIT_DEFAULT, allCareCopy, careCopy, type CareKind } from "./content";
import { CHILD_STAGES } from "./stages";

function strings(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) strings(v, `${path}.${k}`, out);
  return out;
}

const copy = allCareCopy().flatMap(({ path, value }) => strings(value, path));
const catalogue = new Set(rawProducts.map((p) => p.slug));
const kinds: CareKind[] = ["mom", "baby"];

describe("care copy", () => {
  it("makes no medical promise", () => {
    const hits = copy.flatMap(([path, text]) => BANNED_CLAIMS.filter((re) => re.test(text)).map((re) => `${path}: ${re.source}`));
    expect(hits).toEqual([]);
  });

  it("writes Uzbek oʻ/gʻ with U+02BB", () => {
    expect(copy.filter(([path, text]) => path.includes(".uz") && /[og]['‘’]/i.test(text))).toEqual([]);
  });

  it("quotes subscription percents through placeholders", () => {
    expect(copy.filter(([, text]) => /−\d+%/.test(text))).toEqual([]);
  });

  it("lists only products that are in the catalogue", () => {
    const slugs = [BOX_SLUG, ...KIT_SLUGS, ...KIT_DEFAULT, ...kinds.flatMap((k) => careCopy(k, "uz").sections.flatMap((s) => s.slugs))];
    expect(slugs.filter((s) => !catalogue.has(s))).toEqual([]);
  });

  it("links guides to topics that exist", () => {
    const missing = kinds.flatMap((k) =>
      careCopy(k, "uz").guides.filter((g) => getHealthTopic(g.slug, "uz")?.kind !== g.kind).map((g) => g.slug),
    );
    expect(missing).toEqual([]);
  });

  it("has a checklist and a name for every stage in both languages", () => {
    for (const locale of locales) {
      const mom = careCopy("mom", locale).tracker;
      expect(mom.checklist).toHaveLength(3);
      expect(mom.stageNames).toHaveLength(3);
      const baby = careCopy("baby", locale).tracker;
      expect(baby.checklist).toHaveLength(CHILD_STAGES.length);
      expect(baby.stageNames).toHaveLength(CHILD_STAGES.length);
    }
  });

  it("keeps both languages the same shape", () => {
    for (const kind of kinds) {
      const shape = (v: unknown): unknown =>
        Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;
      expect(shape(careCopy(kind, "ru"))).toEqual(shape(careCopy(kind, "uz")));
    }
  });
});
