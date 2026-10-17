import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  The code the customer applied in the cart, kept across reloads. Only the
  code: what it is worth is asked of the server every time (and decided by
  it when the order is placed), so a stale value here can never price an
  order.
*/
interface PromoState {
  code: string | null;
  setCode: (code: string | null) => void;
}

export const usePromoCode = create<PromoState>()(
  persist(
    (set) => ({
      code: null,
      setCode: (code) => set({ code }),
    }),
    { name: STORAGE_KEYS.promo, partialize: (s) => ({ code: s.code }) },
  ),
);
