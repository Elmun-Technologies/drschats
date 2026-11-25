import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listAllSlugs } from "@/lib/shopflow/mock";
import { BANNED_CLAIMS } from "./claims";
import { WORLD_ENTRIES, topicWorld } from "./topic-worlds";
import { getHealthTopic } from "./health-topics";
import type { HealthTopicKind } from "./health-topics";

const catalogue = new Set(listAllSlugs().map((p) => p.slug));
const bankFile = (src: string) => join(process.cwd(), "public", src);

describe.each(WORLD_ENTRIES.map(([key]) => [key] as const))("world %s", (key) => {
  const [kind, slug] = key.split("/") as [HealthTopicKind, string];

  it.each(["uz", "ru"] as const)("%s: copy carries no medical promise and uz uses ʻ", (locale) => {
    const w = topicWorld(kind, slug, locale)!;
    const texts = [w.eyebrow, w.dayTitle, w.dayIntro, w.bundle.title, w.bundle.text, ...w.stats.map((s) => s.label), ...w.steps.flatMap((s) => [s.title, s.body])];
    for (const text of texts) {
      for (const re of BANNED_CLAIMS) expect(text, text).not.toMatch(re);
      if (locale === "uz") expect(text, text).not.toMatch(/[oOgG]['’‘]/);
    }
  });

  it("every photo exists and products are in the catalogue and on the topic", () => {
    const w = topicWorld(kind, slug, "uz")!;
    const topic = getHealthTopic(slug, "uz");
    expect(topic).toBeTruthy();
    const onTopic = new Set(topic!.productSlugs);
    for (const src of [w.hero.src, ...w.steps.flatMap((s) => (s.image ? [s.image.src] : []))]) expect(existsSync(bankFile(src)), src).toBe(true);
    for (const p of [...w.bundle.slugs, ...w.steps.flatMap((s) => (s.productSlug ? [s.productSlug] : []))]) {
      expect(catalogue.has(p), p).toBe(true);
      expect(onTopic.has(p), p).toBe(true);
    }
  });
});
