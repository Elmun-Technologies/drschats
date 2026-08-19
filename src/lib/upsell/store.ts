import { create } from "zustand";
import type { UpsellStep } from "./ladder";

interface UpsellState {
  steps: UpsellStep[];
  currentStep: number;
  isOpen: boolean;
  /** Total savings accumulated from accepted steps so far */
  cumulativeSavings: number;
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

export const useUpsell = create<UpsellState>()((set, get) => ({
  steps: [],
  currentStep: 0,
  isOpen: false,
  cumulativeSavings: 0,
  shown: false,

  openLadder: (steps) =>
    set({ steps, currentStep: 0, isOpen: true, cumulativeSavings: 0, shown: true }),

  nextStep: (savedOnThisStep) => {
    const { currentStep, steps, cumulativeSavings } = get();
    const next = currentStep + 1;
    if (next >= steps.length) {
      set({ isOpen: false });
    } else {
      set({ currentStep: next, cumulativeSavings: cumulativeSavings + savedOnThisStep });
    }
  },

  skipStep: () => {
    const { currentStep, steps } = get();
    const next = currentStep + 1;
    if (next >= steps.length) {
      set({ isOpen: false });
    } else {
      set({ currentStep: next });
    }
  },

  closeLadder: () => set({ isOpen: false }),

  markShown: () => set({ shown: true }),
}));
