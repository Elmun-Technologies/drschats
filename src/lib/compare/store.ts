import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/** A table wider than four columns stops being readable on a laptop. */
export const COMPARE_LIMIT = 4;

interface CompareState {
  items: string[]; // productIds, oldest first
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

/*
  Products picked for /compare. Same shape as the wishlist: ids in this
  browser only. Adding a fifth drops the oldest, so the button never fails.
*/
export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (productId) =>
        set((state) =>
          state.items.includes(productId)
            ? { items: state.items.filter((id) => id !== productId) }
            : { items: [...state.items, productId].slice(-COMPARE_LIMIT) },
        ),
      remove: (productId) => set((state) => ({ items: state.items.filter((id) => id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: STORAGE_KEYS.compare },
  ),
);
