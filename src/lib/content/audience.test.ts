import { describe, expect, it } from "vitest";
import { AUDIENCE_PAGES } from "./audience";
import { getHealthTopic } from "./health-topics";

describe("home audience cards", () => {
  it("lead to pages that exist", () => {
    for (const href of Object.values(AUDIENCE_PAGES)) {
      const goal = href.match(/^\/goals\/(.+)$/);
      if (goal) expect(getHealthTopic(goal[1], "uz"), href).toBeTruthy();
      else expect(["/care/mom", "/care/baby"]).toContain(href);
    }
  });
});
