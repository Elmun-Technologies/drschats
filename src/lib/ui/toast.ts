import { create } from "zustand";

export interface AddedItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
}

interface Toast {
  id: number;
  /** What happened: an add to the cart (default) or a copied link. */
  kind: "cart" | "copied";
  /** The product just added — the confirmation card shows it with suggestions. */
  item?: AddedItem;
}

interface ToastState {
  toasts: Toast[];
  notify: (item?: AddedItem) => void;
  /** "Link copied" — the share button's fallback when there is no share sheet. */
  copied: () => void;
  dismiss: (id: number) => void;
}

let counter = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

/** The add-to-cart confirmation. One at a time: a new add replaces the previous card. */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  notify: (item) => {
    const id = ++counter;
    timers.forEach(clearTimeout);
    timers.clear();
    set({ toasts: [{ id, kind: "cart", item }] });
    timers.set(
      id,
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), item ? 7000 : 2600),
    );
  },
  copied: () => {
    const id = ++counter;
    set({ toasts: [{ id, kind: "copied" }] });
    timers.set(id, setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600));
  },
  dismiss: (id) => {
    clearTimeout(timers.get(id));
    timers.delete(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
