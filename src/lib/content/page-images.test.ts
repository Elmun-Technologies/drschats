import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getIngredients } from "./ingredients";
import { getProgramSlugs } from "./programs";
import { PAGE_IMAGE_FILES, ingredientImage, programImage } from "./page-images";
import { topicImageSrc, type TopicImage } from "./topic-images";

const programSlugs = getProgramSlugs();
const ingredientSlugs = getIngredients("uz").map((i) => i.slug);

function check(image: TopicImage | null) {
  expect(image).not.toBeNull();
  expect(existsSync(join(process.cwd(), "public", topicImageSrc(image!)))).toBe(true);
  expect(image!.alt.uz.length).toBeGreaterThan(8);
  expect(image!.alt.ru.length).toBeGreaterThan(8);
  expect(image!.alt.uz).not.toMatch(/[oOgG]['’`]/);
}

describe("page images", () => {
  it.each(programSlugs)("program %s has a bank photo", (slug) => check(programImage(slug)));
  it.each(ingredientSlugs)("ingredient %s has a bank photo", (slug) => check(ingredientImage(slug)));

  it("does not reuse one photo twice", () => {
    expect(PAGE_IMAGE_FILES.length - new Set(PAGE_IMAGE_FILES).size).toBe(0);
  });
});
