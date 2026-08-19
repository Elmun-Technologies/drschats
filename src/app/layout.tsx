import type { ReactNode } from "react";

// The real <html>/<body> shell lives in app/[locale]/layout.tsx so it can set
// the correct lang attribute per locale. This root layout is a passthrough.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
