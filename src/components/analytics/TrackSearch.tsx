"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/analytics/events";

/** Reports a site search from the server-rendered results page. */
export function TrackSearch({ term }: { term: string }) {
  useEffect(() => {
    if (term) trackSearch(term);
  }, [term]);
  return null;
}
