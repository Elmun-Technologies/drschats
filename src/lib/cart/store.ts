import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "./pricing";
import { useToast } from "@/lib/ui/toast";

const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  _savedAt: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
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
      add: (line, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
              _savedAt: Date.now(),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }], _savedAt: Date.now() };
        });
        // Premium, non-intrusive feedback instead of force-opening the drawer.
        useToast.getState().notify();
      },
      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId ? { ...l, quantity } : l,
                ),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "alimkhanov-cart",
      partialize: (state) => ({ lines: state.lines, _savedAt: state._savedAt }),
      merge: (persisted, current) => {
        const p = persisted as { lines: CartLine[]; _savedAt: number };
        if (p._savedAt && Date.now() - p._savedAt > CART_TTL_MS) {
          return { ...current, lines: [], _savedAt: 0 };
        }
        return { ...current, ...p };
      },
    },
  ),
);
