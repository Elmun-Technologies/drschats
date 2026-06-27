import type { ReactNode } from "react";

// Re-mounts on every navigation → a subtle CSS fade-in between routes.
// CSS-only (no JS) so it can never leave content hidden on a hydration hiccup.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
