"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/lib/i18n/navigation";

/*
  Where the language switch points: this page, with its query. A plain
  pathname dropped `?q=magniy` and every catalogue filter, so switching
  language on a search or a filtered shelf started over. The query is read
  after mount — useSearchParams here would turn every static page dynamic.
*/
export function useLocaleSwitchHref() {
  const pathname = usePathname();
  const [query, setQuery] = useState<Record<string, string>>({});
  useEffect(() => {
    setQuery(Object.fromEntries(new URLSearchParams(window.location.search)));
  }, [pathname]);
  return Object.keys(query).length ? { pathname, query } : pathname;
}
