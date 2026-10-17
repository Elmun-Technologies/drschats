"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/analytics/attribution";
import { trackPageView } from "@/lib/analytics/events";
import { redactUrl } from "@/lib/analytics/redact-url";
import { journeyPage } from "@/lib/journey/client";

/*
  Runs on every route: keeps the order's attribution (utm, click ids, outside
  referrer) and reports client-side navigations to the tags that only see
  hard loads. The first render is skipped for the page view — the tags'
  own snippets already counted it.
*/
export function RouteAnalytics() {
  const pathname = usePathname();
  // Query-only navigations (search terms, filter chips) are page views too.
  const search = useSearchParams().toString();
  const first = useRef(true);

  useEffect(() => {
    captureAttribution();
    if (first.current) {
      first.current = false;
      journeyPage(redactUrl(window.location.pathname, window.location.search));
      return;
    }
    trackPageView(redactUrl(window.location.pathname, window.location.search));
  }, [pathname, search]);

  return null;
}
