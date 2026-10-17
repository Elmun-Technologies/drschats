import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/bot", label: "Klub" },
  { href: "/admin/bot/tickets", label: "Murojaatlar" },
  { href: "/admin/bot/members", label: "Aʼzolar" },
  { href: "/admin/bot/outbox", label: "Xabarlar navbati" },
] as const;

export function BotTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Telegram klub" className="mb-4 flex flex-wrap gap-2">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.href === active ? "page" : undefined}
          className={cn("flex h-11 items-center rounded-sm px-4 text-[15px]", t.href === active ? "bg-ink font-semibold text-white" : "bg-bg text-ink-2")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
