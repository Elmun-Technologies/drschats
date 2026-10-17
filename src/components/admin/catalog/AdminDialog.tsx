"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialog } from "@/lib/ui/useDialog";
import { cn } from "@/lib/utils";

/*
  A modal for the catalogue forms. Rendered into <body> through a portal, so
  a dialog opened from inside the product form is not nested in that <form>:
  its inputs are never submitted with the product, and Enter inside it does
  not save the product.
*/
export function AdminDialog({
  open,
  onClose,
  title,
  lead,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  // useDialog re-runs (and re-focuses) when its callback changes; callers pass inline arrows.
  const latestClose = useRef(onClose);
  useEffect(() => {
    latestClose.current = onClose;
  });
  const close = useCallback(() => latestClose.current(), []);
  const ref = useDialog<HTMLDivElement>(open, close);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Yopish" tabIndex={-1} className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-pop sm:rounded-[24px]",
          wide ? "sm:max-w-[960px]" : "sm:max-w-[560px]",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[20px] font-bold leading-7 text-ink">{title}</h2>
            {lead && <p className="mt-1 text-[14px] leading-5 text-muted">{lead}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Yopish" className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-ink hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
