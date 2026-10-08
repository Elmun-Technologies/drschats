"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/analytics/attribution";
import { trackPageView } from "@/lib/analytics/events";

/*
  Runs on every route: keeps the order's attribution (utm, click ids, outside
  referrer) and reports client-side navigations to the tags that only see
  hard loads. The first render is skipped for the page view — the tags'
  own snippets already counted it.
*/
export function RouteAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    captureAttribution();
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView(window.location.pathname + window.location.search);
  }, [pathname]);

  return null;
}
