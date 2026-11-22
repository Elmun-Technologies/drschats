import { describe, expect, it } from "vitest";
import { listArticleSlugs } from "@/lib/content/blog";
import { llmsTxt } from "./llms";

describe("llmsTxt", () => {

  it("starts with the H1 and a blockquote summary", async () => {
    const text = await llmsTxt("https://example.test");
    expect(text.startsWith("# govita\n\n> ")).toBe(true);
  });

  it("links only to the given origin", async () => {
    const text = await llmsTxt("https://example.test");
    const urls = text.match(/\]\((https?:[^)]+)\)/g) ?? [];
    expect(urls.length).toBeGreaterThan(8);
    for (const u of urls) expect(u.startsWith("](https://example.test/")).toBe(true);
  });

  it("lists real articles only", async () => {
    const text = await llmsTxt("https://example.test");
    const slugs = new Set(listArticleSlugs());
    const linked = [...text.matchAll(/\/uz\/blog\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(0);
    for (const s of linked) expect(slugs.has(s)).toBe(true);
  });
});
