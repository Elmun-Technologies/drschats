import { create } from "zustand";

interface Toast {
  id: number;
}

interface ToastState {
  toasts: Toast[];
  notify: () => void;
  dismiss: (id: number) => void;
}

let counter = 0;

/** Tiny ephemeral toast queue (used for the add-to-cart confirmation). */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  notify: () => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
