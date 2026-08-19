import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartLineId, type CartLine } from "./pricing";
import { useToast } from "@/lib/ui/toast";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  _savedAt: number;
  /**
   * `silent` suppresses the toast — bulk adds (a programme, a quiz plan) fire
   * one notification of their own instead of one per product.
   */
  add: (
    line: Omit<CartLine, "quantity" | "lineId">,
    quantity?: number,
    options?: { silent?: boolean },
  ) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      _savedAt: 0,
      add: (line, quantity = 1, options) => {
        // The purchase mode is part of the key, so adding the same product
        // one-off and on subscription produces two lines rather than one line
        // whose mode depends on which of them was added first.
        const lineId = cartLineId(line.productId, line.subscription);
        set((state) => {
          const existing = state.lines.find((l) => l.lineId === lineId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.lineId === lineId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
              _savedAt: Date.now(),
            };
          }
          return {
            lines: [...state.lines, { ...line, lineId, quantity }],
            _savedAt: Date.now(),
          };
        });
        // Premium, non-intrusive feedback instead of force-opening the drawer.
        if (!options?.silent) useToast.getState().notify();
      },
      remove: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),
      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.lineId !== lineId)
              : state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: STORAGE_KEYS.cart,
      partialize: (state) => ({ lines: state.lines, _savedAt: state._savedAt }),
      merge: (persisted, current) => {
        const p = persisted as { lines: CartLine[]; _savedAt: number };
        if (p._savedAt && Date.now() - p._savedAt > CART_TTL_MS) {
          return { ...current, lines: [], _savedAt: 0 };
        }
        // Carts saved before lines carried their own key still hold live
        // baskets, so they are given one on read rather than emptied.
        const lines = (p.lines ?? []).map((l) => ({
          ...l,
          lineId: l.lineId ?? cartLineId(l.productId, l.subscription),
        }));
        return { ...current, ...p, lines };
      },
    },
  ),
);
