import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { VISITOR_EVENT_TYPES } from "@/lib/db/schema";
import { MAX_IMPRESSION_SLUGS, impressionSlugs, isRecoList, recoItems } from "./lists";

describe("recommendation lists", () => {
  it("keeps valid, unique slugs in rail order, capped", () => {
    expect(impressionSlugs(["a-1", "a-1", "Bad Slug", "b-2"])).toEqual(["a-1", "b-2"]);
    const many = Array.from({ length: 40 }, (_, i) => `p-${i}`);
    expect(impressionSlugs(many)).toHaveLength(MAX_IMPRESSION_SLUGS);
  });

  it("knows its rail ids", () => {
    expect(isRecoList("pdp_similar")).toBe(true);
    expect(isRecoList("anything")).toBe(false);
  });

  it("hands the tracker four fields per product", () => {
    const product = { slug: "x", name: "X", price: 1000, categorySlug: undefined, images: [], id: "1" };
    expect(recoItems([product])).toEqual([{ slug: "x", name: "X", price: 1000, categorySlug: null }]);
  });

  /*
    visitor_events.type has a CHECK constraint; an event type the code sends
    but the database refuses loses the whole batch it travels in.
  */
  it("every journey event type is allowed by the latest database constraint", () => {
    const dir = path.join(process.cwd(), "db/migrations");
    const latest = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => readFileSync(path.join(dir, f), "utf8"))
      .filter((sql) => /visitor_events[\s\S]*?type[\s\S]*?check \(type in \(/i.test(sql))
      .at(-1)!;
    const block = latest.slice(latest.search(/check \(type in \(/i));
    const allowed = [...block.slice(0, block.indexOf(")")).matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    expect(new Set(allowed)).toEqual(new Set(VISITOR_EVENT_TYPES));
  });
});
