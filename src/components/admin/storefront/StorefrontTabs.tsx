import { ChipNav } from "@/components/admin/ui";

export type StorefrontSection = "banners" | "announcements" | "deal";

const ITEMS: { key: StorefrontSection; href: string; label: string }[] = [
  { key: "banners", href: "/admin/storefront", label: "Bannerlar" },
  { key: "announcements", href: "/admin/storefront/announcements", label: "Eʼlon qatori" },
  { key: "deal", href: "/admin/storefront/deal", label: "Bugungi taklif" },
];

/* One tab row over the three things the storefront shows from the panel. */
export function StorefrontTabs({ active }: { active: StorefrontSection }) {
  return (
    <ChipNav
      label="Vitrina boʻlimlari"
      className="mb-5"
      items={ITEMS.map((item) => ({ href: item.href, label: item.label, active: item.key === active }))}
    />
  );
}
