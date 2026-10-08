import { describe, expect, it } from "vitest";
import { listAllSlugs } from "@/lib/shopflow/mock";
import { getIngredients } from "./ingredients";
import { getHealthTopics } from "./health-topics";
import { getPrograms } from "./programs";

/*
  Ingredients, health topics and programmes name products by slug. Every one
  of those slugs once belonged to a catalogue that was replaced, so the
  ingredient guide listed products that do not exist, the quiz could not match
  any nutrient to a pack, and the immunity programme was filled from the whole
  "vitamins" category instead. A slug here must be a product on sale.
*/
const catalogue = new Set(listAllSlugs().map((p) => p.slug));
const dead = (slugs: string[]) => slugs.filter((s) => !catalogue.has(s));

describe("content links to the catalogue", () => {
  it.each(getIngredients("uz").map((i) => [i.slug, i.inProducts] as const))("ingredient %s", (_s, slugs) => {
    expect(dead(slugs)).toEqual([]);
  });
  it.each(getHealthTopics("uz").map((t) => [t.slug, t.productSlugs] as const))("topic %s", (_s, slugs) => {
    expect(dead(slugs)).toEqual([]);
  });
  it.each(getPrograms("uz").map((p) => [p.slug, p.productSlugs] as const))("programme %s", (_s, slugs) => {
    expect(dead(slugs)).toEqual([]);
  });
});
