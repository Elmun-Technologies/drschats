"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const GROUPS = [
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
      { href: "/admin/funnel", label: "Savdo voronkasi", icon: "funnel" },
      { href: "/admin/customers", label: "Mijozlar", icon: "users" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/products", label: "Mahsulotlar", icon: "box" },
      { href: "/admin/categories", label: "Kategoriyalar", icon: "grid" },
      { href: "/admin/brands", label: "Brendlar", icon: "tag" },
    ],
  },
  {
    label: "Oʻsish va kanallar",
    items: [
      { href: "/admin/marketing", label: "Marketing", icon: "megaphone" },
      { href: "/admin/content", label: "Blog va kontent", icon: "file" },
      { href: "/admin/integrations", label: "Integratsiyalar", icon: "plug" },
      { href: "/admin/bot", label: "Telegram klub", icon: "message" },
    ],
  },
  {
    label: "Jamoa",
    items: [{ href: "/admin/users", label: "Administratorlar", icon: "settings" }],
  },
] as const;

function Icon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v10h13V9M9 19v-6h6v6" /></>,
    chart: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /><path d="M17 6h1v1" /></>,
    orders: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    funnel: <><path d="M4 5h16l-6 7v5l-4 2v-7z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3 2.5-4.5 5.5-4.5s5 1.5 5.5 4.5" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.7c2 .5 3.2 1.9 3.5 4.3" /></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v8.5" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    tag: <><path d="M20 13 13 20 4 11V4h7z" /><circle cx="8" cy="8" r="1" /></>,
    megaphone: <><path d="M4 12v-2a2 2 0 0 1 2-2h3l8-4v14l-8-4H6a2 2 0 0 1-2-2z" /><path d="m9 14 1.5 5H14l-2-4.5M17 8l3-2M17 14l3 2" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>,
    plug: <><path d="M8 4v5M16 4v5M6 9h12v2a6 6 0 0 1-6 6v4M9 9V6h6v3" /></>,
    message: <><path d="M4 5h16v12H9l-5 4z" /><path d="M8 10h8M8 13h5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.9.1l-.2.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.7-1l-.2.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.1-1.9l-.1-.2v-3.4l.2-.1a1.7 1.7 0 0 0 1-1.7l-.1-.2 1.7-2.9.2.1a1.7 1.7 0 0 0 1.9-.1l.2-.1h3.4l.1.2a1.7 1.7 0 0 0 1.7 1l.2-.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .1 1.9l.1.2v3.4z" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" {...common}>{paths[name] ?? paths.file}</svg>;
}

export function AdminNav({ onNavigate, previewMode = false }: { onNavigate?: () => void; previewMode?: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Boshqaruv menyusi" className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">{group.label}</p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const href = previewMode ? item.href.replace("/admin", "/admin-preview") : item.href;
              const active = "exact" in item && item.exact ? path === href : path === href || path.startsWith(`${href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-10 items-center gap-3 rounded-md border border-transparent px-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
                      active ? "bg-[#f1f3f0] text-forest" : "text-ink-2 hover:border-line hover:bg-white hover:text-ink",
                    )}
                  >
                    <span className={cn("transition-colors", active ? "text-forest" : "text-muted group-hover:text-forest")}><Icon name={item.icon} /></span>
                    <span>{item.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
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
