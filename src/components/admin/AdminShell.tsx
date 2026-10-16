"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const PAGE_NAMES: Array<[string, string]> = [
  ["/admin/analytics", "Analitika"],
  ["/admin/orders", "Buyurtmalar"],
  ["/admin/funnel", "Savdo voronkasi"],
  ["/admin/customers", "Mijozlar"],
  ["/admin/products", "Mahsulotlar"],
  ["/admin/categories", "Kategoriyalar"],
  ["/admin/brands", "Brendlar"],
  ["/admin/marketing", "Marketing"],
  ["/admin/content/studio", "Kontentni tahrirlash"],
  ["/admin/content", "Blog va kontent"],
  ["/admin/integrations", "Integratsiyalar"],
  ["/admin/bot/tickets", "Murojaatlar"],
  ["/admin/bot/members", "Klub aʼzolari"],
  ["/admin/bot/outbox", "Xabarlar navbati"],
  ["/admin/bot", "Telegram klub"],
  ["/admin/users", "Administratorlar"],
];

function shortName(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "GV";
}

export function AdminShell({
  admin,
  logout,
  children,
  previewMode = false,
}: {
  admin: { name: string; email: string };
  logout: ReactNode;
  children: ReactNode;
  previewMode?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const adminPath = previewMode ? pathname.replace(/^\/admin-preview(?=\/|$)/, "/admin") : pathname;
  const pageTitle = useMemo(() => {
    if (adminPath === "/admin") return "Bosh sahifa";
    if (adminPath.startsWith("/admin/customers/")) return "Mijoz profili";
    if (adminPath.startsWith("/admin/orders/")) return "Buyurtma tafsiloti";
    if (adminPath.startsWith("/admin/products/")) return adminPath.endsWith("/new") ? "Yangi mahsulot" : "Mahsulot tahriri";
    const match = PAGE_NAMES.find(([href]) => adminPath === href || adminPath.startsWith(`${href}/`));
    return match?.[1] ?? "Boshqaruv";
  }, [adminPath]);

  return (
    <div className="min-h-screen bg-tile text-ink lg:flex">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-30 bg-ink/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col overflow-y-auto border-r border-line bg-white px-4 pb-4 pt-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-start justify-between px-2">
          <Link href={previewMode ? "/admin-preview" : "/admin"} aria-label="Go Vita boshqaruv paneli" className="group min-w-0" onClick={() => setMobileOpen(false)}>
            <Logo className="text-[27px]" />
            <span className="mt-1.5 flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Commerce workspace</span>
              <span className="rounded-sm bg-tile px-1.5 py-0.5 text-[8px] font-bold tracking-[0.1em] text-forest">ADMIN</span>
            </span>
          </Link>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-tile hover:text-ink lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Yopish">
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="mb-6 rounded-md border border-line bg-[#f1f3f0] px-3.5 py-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Ish maydoni</p>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="relative grid h-7 w-7 place-items-center rounded-sm bg-forest text-[9px] font-bold text-white">GV<span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-gold ring-2 ring-forest" /></span>
            <span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-ink">Go Vita Uzbekistan</span><span className="mt-0.5 block text-[9px] text-muted">Savdo boshqaruvi</span></span>
          </div>
        </div>

        <AdminNav onNavigate={() => setMobileOpen(false)} previewMode={previewMode} />

        <div className="mt-auto pt-5">
          <a href="/uz" target="_blank" rel="noopener noreferrer" className="mb-4 flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-ink-2 transition hover:bg-tile hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[17px] w-[17px]"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>
            Saytni ko‘rish
            <span className="ml-auto text-muted">↗</span>
          </a>
          <div className="flex items-center gap-3 border-t border-line px-2 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f3f0] text-[11px] font-bold text-forest">{shortName(admin.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold text-ink">{admin.name}</span>
              <span className="block truncate text-[9px] text-muted">{admin.email}</span>
            </span>
            {logout}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line text-ink-2 transition hover:bg-tile lg:hidden" aria-label="Menyuni ochish">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">{pageTitle}</p>
              <p className="hidden text-[10px] text-muted sm:block">Go Vita <span className="px-1.5 text-gold">/</span> Boshqaruv paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className={cn("inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-[9px] font-semibold", previewMode ? "border-[#fbf6eb] bg-[#fbf6eb] text-[#806a3e]" : "border-line bg-white text-ink-2")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", previewMode ? "bg-gold" : "bg-forest")} />
              {previewMode ? "Demo · namuna maʼlumot" : "Himoyalangan admin"}
            </span>
            <span className="hidden h-7 w-px bg-line sm:block" />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">{shortName(admin.name)}</span>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1680px] px-4 py-6 sm:px-6 sm:py-7 lg:px-9 lg:py-8">
          {children}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10px] text-muted">
            <span>{previewMode ? "DEMO rejimi · Raqamlar namuna, amaldagi maʼlumot emas." : "Go Vita Admin · Faqat vakolatli xodimlar uchun."}</span>
            <span className="font-medium text-forest">Go Vita <span className="text-gold">·</span> Uzbekistan</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
