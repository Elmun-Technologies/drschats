import { beforeEach, describe, expect, it } from "vitest";
import { useUpsell } from "./store";
import type { UpsellStep } from "./ladder";

const step = (stepType: UpsellStep["stepType"]) => ({ stepType, savedAmount: 1000 }) as unknown as UpsellStep;
const ladder = [step("standard"), step("standard"), step("free_gift")];

beforeEach(() => useUpsell.setState({ steps: [], currentStep: 0, isOpen: false, cumulativeSavings: 0, accepted: 0, shown: false }));

describe("upsell ladder", () => {
  it("reaches the free gift after two accepted steps", () => {
    useUpsell.getState().openLadder(ladder);
    useUpsell.getState().nextStep(1000);
    useUpsell.getState().nextStep(2000);
    expect(useUpsell.getState()).toMatchObject({ isOpen: true, currentStep: 2, cumulativeSavings: 3000, accepted: 2 });
  });

  it("ends instead of offering an unearned gift after a skip", () => {
    useUpsell.getState().openLadder(ladder);
    useUpsell.getState().nextStep(1000);
    useUpsell.getState().skipStep();
    expect(useUpsell.getState().isOpen).toBe(false);
  });

  it("counts the last step's savings", () => {
    useUpsell.getState().openLadder([step("standard")]);
    useUpsell.getState().nextStep(1500);
    expect(useUpsell.getState()).toMatchObject({ isOpen: false, cumulativeSavings: 1500, accepted: 1 });
  });
});
