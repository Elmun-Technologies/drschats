import "@/styles/globals.css";
import type { ReactNode } from "react";

/** Development-only visual preview; this route is not served in production. */
export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-[#f1f3f0] font-sans text-[#0f2d24] antialiased">{children}</body>
    </html>
  );
}
