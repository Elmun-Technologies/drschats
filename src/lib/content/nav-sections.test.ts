import { describe, expect, it } from "vitest";
import { ALL_TOPIC_PATHS, isNavigable } from "./nav-sections";

describe("isNavigable", () => {
  it("leaves every non-topic link alone", () => {
    for (const href of ["/", "/products", "/quiz", "/blog", "/programs"]) {
      expect(isNavigable(href, [])).toBe(true);
    }
  });

  it("hides a topic family with nothing published", () => {
    expect(isNavigable("/vitamins", ["/goals", "/symptoms"])).toBe(false);
  });

  it("shows a family the moment it has one page", () => {
    expect(isNavigable("/vitamins", ["/vitamins"])).toBe(true);
  });

  it("hides all three when nothing at all is written", () => {
    for (const href of ALL_TOPIC_PATHS) {
      expect(isNavigable(href, [])).toBe(false);
    }
  });

  it("covers exactly the three health families", () => {
    expect(ALL_TOPIC_PATHS).toEqual(["/goals", "/symptoms", "/vitamins"]);
  });
});
