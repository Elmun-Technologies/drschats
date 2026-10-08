import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/admin/_actions/auth";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-line bg-bg p-4 lg:sticky lg:top-0 lg:h-screen lg:w-[240px] lg:border-r lg:p-5">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="font-logo text-2xl">Go Vita</Link>
          <p className="text-[13px] text-muted lg:mt-1">{admin.name}</p>
        </div>
        <AdminNav />
        <form action={logout} className="lg:mt-auto">
          <button type="submit" className="h-11 w-full rounded-sm text-left text-[15px] text-ink-2 hover:text-ink">Chiqish</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
