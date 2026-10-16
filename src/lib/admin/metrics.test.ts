import { describe, expect, it } from "vitest";
import { funnelStages } from "./metrics";

describe("order fulfillment funnel", () => {
  it("counts later statuses as having passed earlier stages", () => {
    const stages = funnelStages({ new: 3, confirmed: 2, shipped: 1, delivered: 4, cancelled: 1 });
    expect(stages.map((stage) => stage.value)).toEqual([11, 7, 5, 4]);
    expect(stages.map((stage) => stage.share)).toEqual([100, 64, 45, 36]);
    expect(stages.map((stage) => stage.rate)).toEqual([null, 64, 71, 80]);
  });

  it("returns zero shares safely when there are no orders", () => {
    const stages = funnelStages({ new: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 });
    expect(stages.map((stage) => stage.value)).toEqual([0, 0, 0, 0]);
    expect(stages.map((stage) => stage.share)).toEqual([0, 0, 0, 0]);
    expect(stages.map((stage) => stage.rate)).toEqual([null, null, null, null]);
  });
});
