import { create } from "zustand";

/*
  The cart's points state: the redemption token from the SMS code, bound to
  one phone. Memory only — a reload asks for a new code, and the token is
  worthless without the server re-checking it at order time anyway.
*/
interface PointsState {
  phone9: string | null;
  token: string | null;
  balance: number;
  /** The customer chose to spend them on this order. */
  use: boolean;
  verified: (phone9: string, token: string, balance: number) => void;
  setUse: (use: boolean) => void;
  clear: () => void;
}

export const usePoints = create<PointsState>()((set) => ({
  phone9: null,
  token: null,
  balance: 0,
  use: false,
  verified: (phone9, token, balance) => set({ phone9, token, balance, use: true }),
  setUse: (use) => set({ use }),
  clear: () => set({ phone9: null, token: null, balance: 0, use: false }),
}));
