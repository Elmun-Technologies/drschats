"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const NAV_GROUPS = [
  {
    label: "Umumiy",
    items: [
      { href: "/admin", label: "Bosh sahifa", icon: "home", exact: true },
      { href: "/admin/analytics", label: "Analitika", icon: "chart" },
    ],
  },
  {
    label: "Savdo",
    items: [
      { href: "/admin/orders", label: "Buyurtmalar", icon: "orders" },
      { href: "/admin/customers", label: "Mijozlar", icon: "users" },
      { href: "/admin/visitors", label: "Mijozlar yoʻli", icon: "route" },
      { href: "/admin/funnel", label: "Voronka", icon: "funnel" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/segments", label: "Segmentlar va retarget", icon: "target" },
      { href: "/admin/storefront", label: "Vitrina", icon: "layout" },
      { href: "/admin/promotions", label: "Aksiyalar", icon: "percent" },
      { href: "/admin/promocodes", label: "Promokodlar", icon: "ticket" },
      { href: "/admin/campaigns", label: "Kampaniyalar", icon: "megaphone" },
      { href: "/admin/marketing", label: "UTM havolalar", icon: "link" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/products", label: "Mahsulotlar", icon: "box" },
      { href: "/admin/categories", label: "Kategoriyalar", icon: "grid" },
      { href: "/admin/brands", label: "Brendlar", icon: "tag" },
      { href: "/admin/waitlist", label: "Kutayotganlar", icon: "bell" },
    ],
  },
  {
    label: "Kanallar",
    items: [
      { href: "/admin/bot", label: "Telegram klub", icon: "message" },
      { href: "/admin/content", label: "Blog va kontent", icon: "file" },
    ],
  },
  {
    label: "Sozlamalar",
    items: [
      { href: "/admin/commerce", label: "Savdo qoidalari", icon: "sliders" },
      { href: "/admin/integrations", label: "Integratsiyalar", icon: "plug" },
      { href: "/admin/users", label: "Administratorlar", icon: "settings" },
    ],
  },
] as const;

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v10h13V9M9 19v-6h6v6" /></>,
    chart: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    orders: <><path d="M6 7h12l-1 13H7z" /><path d="M9 7a3 3 0 0 1 6 0" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3 2.5-4.5 5.5-4.5s5 1.5 5.5 4.5" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.7c2 .5 3.2 1.9 3.5 4.3" /></>,
    route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" /></>,
    funnel: <path d="M4 5h16l-6 7v5l-4 2v-7z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" /></>,
    percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.2" /><circle cx="17" cy="17" r="2.2" /></>,
    megaphone: <><path d="M4 12v-2a2 2 0 0 1 2-2h3l8-4v14l-8-4H6a2 2 0 0 1-2-2z" /><path d="m9 14 1.5 5H14l-2-4.5" /></>,
    layout: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 9h17M9 9v11" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v8.5" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    tag: <><path d="M20 13 13 20 4 11V4h7z" /><circle cx="8" cy="8" r="1" /></>,
    ticket: <><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z" /><path d="M14 7v10" strokeDasharray="2 2" /></>,
    bell: <><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
    message: <><path d="M4 5h16v12H9l-5 4z" /><path d="M8 10h8M8 13h5" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>,
    plug: <><path d="M8 4v5M16 4v5M6 9h12v2a6 6 0 0 1-6 6v4" /></>,
    sliders: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5 shrink-0", className)}>
      {paths[name] ?? paths.file}
    </svg>
  );
}

export function isActive(path: string, href: string, exact?: boolean) {
  return exact ? path === href : path === href || path.startsWith(`${href}/`);
}

export type NavBadges = Partial<Record<string, number>>;

export function AdminNav({ onNavigate, badges = {} }: { onNavigate?: () => void; badges?: NavBadges }) {
  const path = usePathname();
  return (
    <nav aria-label="Boshqaruv menyusi" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[13px] font-semibold text-muted">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(path, item.href, "exact" in item && item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                      active ? "bg-tile font-semibold text-ink" : "text-ink-2 hover:bg-tile hover:text-ink",
                    )}
                  >
                    <NavIcon name={item.icon} className={active ? "text-ink" : "text-muted"} />
                    <span>{item.label}</span>
                    {(badges[item.href] ?? 0) > 0 && (
                      <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-[12px] font-bold tabular-nums text-white" aria-label={`${badges[item.href]} ta yangi`}>
                        {badges[item.href]! > 99 ? "99+" : badges[item.href]}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
