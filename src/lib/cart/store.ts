import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartLineId, freeGiftAllowed, lineQtyCap, type CartLine } from "./pricing";
import { useToast } from "@/lib/ui/toast";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { itemOf, trackAddToCart, trackRemoveFromCart } from "@/lib/analytics/events";
import { saleOver } from "@/lib/shop/sale";

const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/*
  Offer lines keep the shape the server accepts: the free gift stays one
  unit and leaves the cart once the steps that paid for it are gone.
*/
/** A line whose sale has ended carries the old price again. */
function priced<T extends { price: number; oldPrice?: number; saleEndsAt?: string }>(l: T): T {
  return saleOver(l) ? { ...l, price: l.oldPrice as number, oldPrice: undefined, saleEndsAt: undefined } : l;
}

function settle(lines: CartLine[]): CartLine[] {
  const clamped = lines.map((l) => (l.quantity > lineQtyCap(l) ? { ...l, quantity: lineQtyCap(l) } : l));
  return freeGiftAllowed(clamped) ? clamped : clamped.filter((l) => l.upsellDiscountPercent !== 100);
}

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
  /**
   * Bring stored lines up to today's catalogue: a cart lives thirty days, so
   * its prices can be stale. Prices and sold-out flags change; only an
   * invalid free gift is removed (see `settle`).
   */
  /** Reprice lines whose sale has ended (called at the deadline). */
  expireSales: () => void;
  syncPrices: (current: Record<string, { price: number; oldPrice?: number; saleEndsAt?: string; inStock: boolean }>) => void;
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
      add: (added, quantity = 1, options) => {
        // Every add path goes through here, so a sale that ended after the
        // page rendered can never re-enter the cart at its sale price.
        const line = priced(added);
        // The purchase mode is part of the key, so adding the same product
        // one-off and on subscription produces two lines rather than one line
        // whose mode depends on which of them was added first.
        const lineId = cartLineId(line.productId, line.subscription, line.upsellDiscountPercent);
        set((state) => {
          const existing = state.lines.find((l) => l.lineId === lineId);
          const lines = existing
            ? state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + quantity } : l))
            : [...state.lines, { ...line, lineId, quantity }];
          return { lines: settle(lines), _savedAt: Date.now() };
        });
        trackAddToCart(itemOf(line, quantity, line.upsellDiscountPercent));
        // Premium, non-intrusive feedback instead of force-opening the drawer.
        if (!options?.silent) {
          useToast.getState().notify({ productId: line.productId, slug: line.slug, name: line.name, image: line.image });
        }
      },
      remove: (lineId) =>
        set((state) => {
          const gone = state.lines.find((l) => l.lineId === lineId);
          if (gone) trackRemoveFromCart(itemOf(gone, gone.quantity, gone.upsellDiscountPercent));
          return { lines: settle(state.lines.filter((l) => l.lineId !== lineId)), _savedAt: Date.now() };
        }),
      setQuantity: (lineId, quantity) =>
        set((state) => {
          const line = state.lines.find((l) => l.lineId === lineId);
          if (line && quantity < line.quantity) {
            trackRemoveFromCart(itemOf(line, line.quantity - Math.max(0, quantity), line.upsellDiscountPercent));
          } else if (line && quantity > line.quantity) {
            trackAddToCart(itemOf(line, quantity - line.quantity, line.upsellDiscountPercent));
          }
          return {
            lines: settle(
              quantity <= 0
                ? state.lines.filter((l) => l.lineId !== lineId)
                : state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
            ),
            _savedAt: Date.now(),
          };
        }),
      syncPrices: (current) =>
        set((state) => {
          let changed = false;
          // A product missing from the map is left alone: an empty or partial
          // catalogue read (a failed request) must never empty someone's cart.
          // The server refuses lines it does not sell, with a message.
          const lines = state.lines.map((l) => {
            const entry = current[l.productId];
            // A sale that ended after this page was rendered is over in the cart too.
            const now = entry && priced(entry);
            const soldOut = now ? !now.inStock : l.soldOut;
            if (
              !now ||
              (now.price === l.price && now.oldPrice === l.oldPrice && now.saleEndsAt === l.saleEndsAt && soldOut === l.soldOut)
            )
              return l;
            changed = true;
            return { ...l, price: now.price, oldPrice: now.oldPrice, saleEndsAt: now.saleEndsAt, soldOut: soldOut || undefined };
          });
          // Opening the cart is activity: the thirty days count from here.
          const _savedAt = state.lines.length > 0 ? Date.now() : state._savedAt;
          return changed ? { lines: settle(lines), _savedAt } : { _savedAt };
        }),
      expireSales: () =>
        set((state) => {
          const lines = state.lines.map(priced);
          return lines.some((l, i) => l !== state.lines[i]) ? { lines: settle(lines) } : state;
        }),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: STORAGE_KEYS.cart,
      partialize: (state) => ({ lines: state.lines, _savedAt: state._savedAt }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<{ lines: CartLine[]; _savedAt: number }>;
        if (p._savedAt && Date.now() - p._savedAt > CART_TTL_MS) {
          return { ...current, lines: [], _savedAt: 0 };
        }
        // Carts saved before lines carried their own key still hold live
        // baskets, so they are given one on read rather than emptied.
        const lines = settle(
          (p.lines ?? []).map((l) =>
            priced({
              ...l,
              lineId: cartLineId(l.productId, l.subscription, l.upsellDiscountPercent),
            }),
          ),
        );
        return { ...current, ...p, lines };
      },
    },
  ),
);
