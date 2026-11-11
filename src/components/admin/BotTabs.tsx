import { ChipNav } from "./ui";
import { t } from "@/lib/admin/i18n/server";

const TABS = [
  { href: "/admin/bot", label: "Klub" },
  { href: "/admin/bot/tickets", label: "Murojaatlar" },
  { href: "/admin/bot/members", label: "Aʼzolar" },
  { href: "/admin/bot/outbox", label: "Xabarlar navbati" },
] as const;

export function BotTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return <ChipNav label={t("Telegram klub")} className="mb-4" items={TABS.map((tab) => ({ href: tab.href, label: t(tab.label), active: tab.href === active }))} />;
}
