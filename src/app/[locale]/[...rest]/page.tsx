import { notFound } from "next/navigation";

/*
  Catch-all so an unmatched path under a locale reaches the localised 404.

  Without it the two cases diverge: /uz/product/does-not-exist matches a route
  that calls notFound(), so it renders app/[locale]/not-found.tsx, while
  /uz/does-not-exist matches nothing at all and Next serves its own built-in
  page — unstyled, unlocalised English, no header and no way back. Routing this
  through the [locale] subtree makes both land on the same page.

  A catch-all is the lowest-priority match in the App Router, so every real
  route still wins.
*/
export default function LocaleCatchAll() {
  notFound();
}
