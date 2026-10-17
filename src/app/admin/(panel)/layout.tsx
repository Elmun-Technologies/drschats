import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { logout } from "@/app/admin/_actions/auth";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell
      admin={{ name: admin.name, email: admin.email }}
      logout={
        <form action={logout}>
          <button type="submit" aria-label="Chiqish" title="Chiqish" className="grid h-11 w-11 place-items-center rounded-[12px] text-muted transition-colors hover:bg-tile hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5"><path d="M10 17l5-5-5-5M15 12H4" /><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></svg>
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
