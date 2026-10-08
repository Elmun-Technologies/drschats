import { beforeEach, describe, expect, it } from "vitest";
import { COMPARE_LIMIT, useCompare } from "./store";

describe("compare store", () => {
  beforeEach(() => useCompare.getState().clear());

  it("toggles a product in and out", () => {
    useCompare.getState().toggle("a");
    expect(useCompare.getState().items).toEqual(["a"]);
    useCompare.getState().toggle("a");
    expect(useCompare.getState().items).toEqual([]);
  });

  it("keeps the newest products when over the limit", () => {
    for (let i = 0; i <= COMPARE_LIMIT; i++) useCompare.getState().toggle(`p${i}`);
    expect(useCompare.getState().items).toHaveLength(COMPARE_LIMIT);
    expect(useCompare.getState().items[0]).toBe("p1");
  });
});
