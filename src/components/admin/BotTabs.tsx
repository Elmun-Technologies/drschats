import { ChipNav } from "./ui";

const TABS = [
  { href: "/admin/bot", label: "Klub" },
  { href: "/admin/bot/tickets", label: "Murojaatlar" },
  { href: "/admin/bot/members", label: "Aʼzolar" },
  { href: "/admin/bot/outbox", label: "Xabarlar navbati" },
] as const;

export function BotTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return <ChipNav label="Telegram klub" className="mb-4" items={TABS.map((t) => ({ href: t.href, label: t.label, active: t.href === active }))} />;
}
