"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminNav, NAV_GROUPS, isActive, type NavBadges } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import { useDialog } from "@/lib/ui/useDialog";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "GV";
}

function sectionTitle(path: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isActive(path, item.href, "exact" in item && item.exact)) return item.label;
    }
  }
  return "Boshqaruv";
}

function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <form action="/admin/search" role="search" className="mb-5 px-1" onSubmit={onNavigate}>
      <label className="relative block">
        <span className="sr-only">Panel boʻyicha qidirish</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
        <input name="q" type="search" placeholder="Buyurtma, mijoz, mahsulot…" className="h-11 w-full rounded-[12px] bg-tile pl-10 pr-3 text-[15px] text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ink/30" />
      </label>
    </form>
  );
}

function Sidebar({ admin, logout, onNavigate, badges }: { admin: { name: string; email: string }; logout: ReactNode; onNavigate?: () => void; badges: NavBadges }) {
  return (
    <>
      <Link href="/admin" aria-label="Go Vita boshqaruv paneli" onClick={onNavigate} className="mb-6 flex items-end gap-2.5 px-3">
        <Logo className="text-[30px]" />
        <span className="mb-1 rounded-full bg-tile px-2 py-0.5 text-[13px] font-semibold text-ink-2">admin</span>
      </Link>
      <SearchBox onNavigate={onNavigate} />
      <AdminNav onNavigate={onNavigate} badges={badges} />
      <div className="mt-auto pt-6">
        <a href="/uz" target="_blank" rel="noopener noreferrer" className="mb-3 flex min-h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] text-ink-2 transition-colors hover:bg-tile hover:text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5 text-muted"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>
          Saytni ochish
        </a>
        <div className="flex items-center gap-3 border-t border-line px-3 pt-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-bold text-white">{initials(admin.name)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-ink">{admin.name}</span>
            <span className="block truncate text-[13px] text-muted">{admin.email}</span>
          </span>
          {logout}
        </div>
      </div>
    </>
  );
}

export function AdminShell({ admin, logout, badges = {}, children }: { admin: { name: string; email: string }; logout: ReactNode; badges?: NavBadges; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useDialog<HTMLDivElement>(open, () => setOpen(false));

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-bg text-ink lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col overflow-y-auto border-r border-line bg-bg px-3 pb-5 pt-6 lg:flex">
        <Sidebar admin={admin} logout={logout} badges={badges} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Menyuni yopish" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Boshqaruv menyusi" tabIndex={-1} className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col overflow-y-auto bg-bg px-3 pb-5 pt-4 shadow-pop">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Yopish" className="grid h-11 w-11 place-items-center rounded-[12px] text-ink hover:bg-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <Sidebar admin={admin} logout={logout} badges={badges} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Menyuni ochish" className="grid h-11 w-11 place-items-center rounded-[12px] bg-tile text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <Link href="/admin" aria-label="Go Vita boshqaruv paneli" className="flex items-end gap-2"><Logo className="text-[24px]" /></Link>
          <span className="ml-auto truncate text-[14px] font-semibold text-ink-2">{sectionTitle(pathname)}</span>
        </header>
        <main className={cn("mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10")}>{children}</main>
      </div>
    </div>
  );
}
