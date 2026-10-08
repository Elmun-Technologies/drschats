import { create } from "zustand";
import type { UpsellStep } from "./ladder";

interface UpsellState {
  steps: UpsellStep[];
  currentStep: number;
  isOpen: boolean;
  /** Total savings accumulated from accepted steps so far */
  cumulativeSavings: number;
  /** Steps the customer accepted in this ladder. */
  accepted: number;
  /** Whether the ladder has been shown this session (don't re-show) */
  shown: boolean;

  openLadder: (steps: UpsellStep[]) => void;
  /** Advance to next step (after user accepted current one) */
  nextStep: (savedOnThisStep: number) => void;
  /** Skip current step, advance to next */
  skipStep: () => void;
  closeLadder: () => void;
  /** Mark as shown so we don't re-trigger in this session */
  markShown: () => void;
}

/*
  The free gift is earned by the two discounted steps before it: offering it
  after a skip promised something the server refuses at checkout (reprice.ts
  `freeGiftAllowed`). So the ladder ends instead of reaching an unearned gift.
*/
function advance(steps: UpsellStep[], from: number, accepted: number) {
  const next = from + 1;
  const step = steps[next];
  if (!step || (step.stepType === "free_gift" && accepted < 2)) return { isOpen: false };
  return { currentStep: next };
}

export const useUpsell = create<UpsellState>()((set, get) => ({
  steps: [],
  currentStep: 0,
  isOpen: false,
  cumulativeSavings: 0,
  accepted: 0,
  shown: false,

  openLadder: (steps) =>
    set({ steps, currentStep: 0, isOpen: true, cumulativeSavings: 0, accepted: 0, shown: true }),

  nextStep: (savedOnThisStep) => {
    const { currentStep, steps, cumulativeSavings, accepted } = get();
    set({
      cumulativeSavings: cumulativeSavings + savedOnThisStep,
      accepted: accepted + 1,
      ...advance(steps, currentStep, accepted + 1),
    });
  },

  skipStep: () => {
    const { currentStep, steps, accepted } = get();
    set(advance(steps, currentStep, accepted));
  },

  closeLadder: () => set({ isOpen: false }),

  markShown: () => set({ shown: true }),
}));
