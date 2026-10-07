import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/*
  The CMS admin, kept out of production until it is asked for.

  /studio was publicly reachable and returned 200 for anyone who typed the URL.
  Sanity's own login stops an unauthorised *edit*, so this was not an open
  write path — but it was still 1.52 MB of admin JavaScript on a shop, a
  visible map of the content model, and the one route deliberately excluded
  from the security headers in next.config.ts (`source: "/((?!studio).*)"`) so
  that the Studio's own frames would work. Serving it with no X-Frame-Options
  and no nosniff to an audience that has no reason to see it was a poor trade.

  It also could not do anything: sanity.config.ts falls back to
  projectId "placeholder" when the env vars are absent, so the route rendered a
  login screen for a project that does not exist.

  Off by default in production, on in development, and opt-in with the same
  shape as the other demo flags in this codebase:

      SANITY_STUDIO_ENABLED=on
      NEXT_PUBLIC_SANITY_PROJECT_ID=<real project>

  Both are required in production. A Studio pointed at a placeholder project
  is worse than no Studio, because it looks like the CMS is broken rather than
  absent.
*/
function studioEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.SANITY_STUDIO_ENABLED !== "on") return false;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  return Boolean(projectId) && projectId !== "placeholder";
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  if (!studioEnabled()) notFound();
  return children;
}
