import { describe, expect, it } from "vitest";
import { isOrderActive, orderStepIndex } from "./orders";

describe("order status helpers", () => {
  it("places known statuses on the timeline", () => {
    expect(orderStepIndex("new")).toBe(0);
    expect(orderStepIndex("shipped")).toBe(2);
    expect(orderStepIndex("cancelled")).toBe(-1);
  });

  it("treats delivered and cancelled as finished, anything else as active", () => {
    expect(isOrderActive("delivered")).toBe(false);
    expect(isOrderActive("cancelled")).toBe(false);
    expect(isOrderActive("confirmed")).toBe(true);
    expect(isOrderActive("packing")).toBe(true);
  });
});
