import Link from "next/link";
import { listProducts } from "@/lib/admin/queries";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

export const metadata = { title: "Yangi promokod" };

export default async function NewPromoCodePage() {
  await requireAdmin();
  const products = await listProducts();
  return (
    <>
      <PageHeader eyebrow="Promokodlar" title="Yangi promokod" actions={<Link href="/admin/promocodes" className={secondaryButtonClass}>← Promokodlar</Link>} />
      <Card><PromoCodeForm products={products.map((p) => ({ slug: p.slug, name: p.name }))} /></Card>
    </>
  );
}
