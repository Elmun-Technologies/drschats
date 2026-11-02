import Link from "next/link";
import { listProducts } from "@/lib/admin/queries";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

export const metadata = { title: "Yangi aksiya" };

export default async function NewPromotionPage() {
  await requireAdmin();
  const products = await listProducts();
  return (
    <>
      <PageHeader eyebrow="Aksiyalar" title="Yangi aksiya" actions={<Link href="/admin/promotions" className={secondaryButtonClass}>← Aksiyalar</Link>} />
      <Card><PromotionForm products={products.map((p) => ({ slug: p.slug, name: p.name, categorySlug: p.categorySlug }))} /></Card>
    </>
  );
}
