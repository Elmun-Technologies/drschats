"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The modal plumbing that is easy to leave out and obvious once it's missing:
 * Escape closes, focus moves into the dialog on open and back to whatever
 * opened it on close, and Tab stays inside while it's open.
 *
 * Without this a keyboard user reaching the upsell modal mid-purchase is
 * stranded — focus sits on the button behind the backdrop and Escape does
 * nothing.
 *
 * Returns a ref for the dialog element. That element still needs
 * `role="dialog"`, `aria-modal="true"`, a label, and `tabIndex={-1}` so it can
 * take focus when it holds no controls of its own.
 */
export function useDialog<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    // Focus the first control rather than the container, so the first Tab
    // lands somewhere predictable.
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !ref.current) return;

      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreTo.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return ref;
}
