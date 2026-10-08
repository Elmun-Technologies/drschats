import { describe, expect, it } from "vitest";
import { isStocked } from "./categories";

const cat = (productCount?: number) => ({ id: "c", slug: "c", name: "C", productCount });

describe("isStocked", () => {
  it("keeps a category whose count the backend did not send", () => {
    expect(isStocked(cat(undefined))).toBe(true);
  });

  it("hides only an explicit zero", () => {
    expect(isStocked(cat(0))).toBe(false);
    expect(isStocked(cat(3))).toBe(true);
  });
});
