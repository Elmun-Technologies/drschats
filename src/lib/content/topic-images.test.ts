import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getHealthTopicIndex } from "./health-topics";
import { TOPIC_IMAGE_KEYS, topicImage, topicImageSrc } from "./topic-images";

describe("topic images", () => {
  const topics = getHealthTopicIndex();

  it.each(topics.map((t) => `${t.kind}/${t.slug}`))("%s has a photo", (key) => {
    const [kind, slug] = key.split("/") as [Parameters<typeof topicImage>[0], string];
    expect(topicImage(kind, slug)).not.toBeNull();
  });

  it("names only topics that exist", () => {
    const known = new Set(topics.map((t) => `${t.kind}/${t.slug}`));
    expect(TOPIC_IMAGE_KEYS.filter((k) => !known.has(k))).toEqual([]);
  });

  it.each(TOPIC_IMAGE_KEYS)("%s points at a bank file with uz and ru alt text", (key) => {
    const [kind, slug] = key.split("/") as [Parameters<typeof topicImage>[0], string];
    const image = topicImage(kind, slug)!;
    expect(existsSync(join(process.cwd(), "public", topicImageSrc(image)))).toBe(true);
    expect(image.alt.uz.length).toBeGreaterThan(8);
    expect(image.alt.ru.length).toBeGreaterThan(8);
    expect(image.alt.uz).not.toMatch(/[oOgG]['’`]/);
  });

  it("does not reuse one photo on two pages", () => {
    const files = TOPIC_IMAGE_KEYS.map((k) => {
      const [kind, slug] = k.split("/") as [Parameters<typeof topicImage>[0], string];
      return topicImage(kind, slug)!.file;
    });
    expect(files.length - new Set(files).size).toBe(0);
  });
});
