import { describe, expect, it } from "vitest";
import { listArticleSlugs } from "@/lib/content/blog";
import { llmsTxt } from "./llms";

describe("llmsTxt", () => {
  const text = llmsTxt("https://example.test");

  it("starts with the H1 and a blockquote summary", () => {
    expect(text.startsWith("# govita\n\n> ")).toBe(true);
  });

  it("links only to the given origin", () => {
    const urls = text.match(/\]\((https?:[^)]+)\)/g) ?? [];
    expect(urls.length).toBeGreaterThan(8);
    for (const u of urls) expect(u.startsWith("](https://example.test/")).toBe(true);
  });

  it("lists real articles only", () => {
    const slugs = new Set(listArticleSlugs());
    const linked = [...text.matchAll(/\/uz\/blog\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(0);
    for (const s of linked) expect(slugs.has(s)).toBe(true);
  });
});
