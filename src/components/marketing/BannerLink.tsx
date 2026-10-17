"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { isExternal } from "@/lib/merch/model";
import { onDeadline } from "@/lib/shop/deadline";
import { trackPromotionClick } from "@/lib/analytics/events";

/*
  A link out of an admin-managed banner: a site path through the locale-aware
  Link, an https link in a new tab. A click is counted (trackPromotionClick)
  when the banner came from the panel.
*/
export function BannerLink({
  href,
  banner,
  slot,
  className,
  children,
  ...rest
}: {
  href: string;
  banner?: { id: number; title: string };
  slot: "hero" | "strip" | "category";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const onClick = banner ? () => trackPromotionClick(banner, slot) : undefined;
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

/*
  Items with an end drop out at that second. The server renders the list it
  had; the clock only starts after mount, so server and browser HTML agree.
*/
export function useUnexpired<T extends { endsAt?: string | null }>(items: T[]): T[] {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  useEffect(() => {
    if (now === null) return;
    const next = items
      .map((i) => (i.endsAt ? Date.parse(i.endsAt) : NaN))
      .filter((t) => t > now)
      .sort((a, b) => a - b)[0];
    if (next === undefined) return;
    return onDeadline(next, () => setNow(Date.now()));
  }, [items, now]);
  if (now === null) return items;
  return items.filter((i) => !i.endsAt || Date.parse(i.endsAt) > now);
}
