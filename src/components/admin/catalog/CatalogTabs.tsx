import { catalogCounts } from "@/lib/admin/queries";
import { ChipNav } from "@/components/admin/ui";

export type CatalogSection = "products" | "categories" | "brands";

/* One tab row over Products, Categories and Brands: the catalogue reads as one section. */
export async function CatalogTabs({ active }: { active: CatalogSection }) {
  const counts = await catalogCounts();
  const items: { key: CatalogSection; href: string; label: string; count: number }[] = [
    { key: "products", href: "/admin/products", label: "Mahsulotlar", count: counts.products },
    { key: "categories", href: "/admin/categories", label: "Kategoriyalar", count: counts.categories },
    { key: "brands", href: "/admin/brands", label: "Brendlar", count: counts.brands },
  ];
  return (
    <ChipNav
      label="Katalog boʻlimlari"
      className="mb-5"
      items={items.map((item) => ({ href: item.href, label: item.label, count: item.count, active: item.key === active }))}
    />
  );
}
