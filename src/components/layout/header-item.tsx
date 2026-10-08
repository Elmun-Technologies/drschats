import type { ReactNode } from "react";

/*
  The icon-over-label items on the right of the desktop header (design:
  HeaderV3 `.hi`) and the count badge they share. 64px wide and 44px+ tall,
  so each one clears the tap-target audit on its own.
*/
export const HEADER_ITEM_CLASS =
  "relative flex min-w-16 flex-col items-center gap-[3px] text-[13px] leading-4 text-ink transition-colors hover:text-black";

export function HeaderIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -top-1 left-1/2 ml-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-red px-[5px] text-xs font-bold tabular-nums text-white">
      {children}
    </span>
  );
}

export const ICONS = {
  compare: "M6 20V10M12 20V4M18 20v-7",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
  bag: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  home: "M4 11l8-7 8 7v9h-5v-6H9v6H4z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  pin: "M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  close: "M6 6l12 12M18 6L6 18",
  telegram: "M21 4L3 11l6 2 2 6 3-4 5 4zM9 13l12-9",
} as const;
