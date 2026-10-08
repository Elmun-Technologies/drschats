"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Bosh sahifa", exact: true },
  { href: "/admin/orders", label: "Buyurtmalar" },
  { href: "/admin/products", label: "Mahsulotlar" },
  { href: "/admin/categories", label: "Kategoriyalar" },
  { href: "/admin/brands", label: "Brendlar" },
  { href: "/admin/users", label: "Administratorlar" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col">
      {ITEMS.map((item) => {
        const active = item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 shrink-0 items-center rounded-sm px-3 text-[15px] transition-colors",
              active ? "bg-ink font-semibold text-white" : "text-ink-2 hover:bg-tile hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <a href="/uz" target="_blank" rel="noopener" className="flex h-11 shrink-0 items-center rounded-sm px-3 text-[15px] text-ink-2 hover:bg-tile hover:text-ink">
        Saytni ochish ↗
      </a>
    </nav>
  );
}
