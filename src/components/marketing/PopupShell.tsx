"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDialog } from "@/lib/ui/useDialog";

/**
 * The modal frame every marketing popup shares: backdrop, centred card on
 * desktop, bottom sheet on a phone, Escape, focus trap and a labelled close
 * button. Content is the caller's.
 */
export function PopupShell({
  open,
  onClose,
  labelledBy,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const ref = useDialog<HTMLDivElement>(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            key="dialog"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[24px] bg-bg p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-pop sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-tile hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
