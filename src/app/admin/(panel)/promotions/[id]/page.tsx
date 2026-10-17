import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { promotions } from "@/lib/db/schema";
import { listProducts } from "@/lib/admin/queries";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";

export const metadata = { title: "Aksiya" };

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [[promotion], products] = await Promise.all([getDb().select().from(promotions).where(eq(promotions.id, id)).limit(1), listProducts()]);
  if (!promotion) notFound();
  return (
    <>
      <PageHeader eyebrow="Aksiyalar" title={promotion.title.uz} actions={<Link href="/admin/promotions" className={secondaryButtonClass}>← Aksiyalar</Link>} />
      <Card><PromotionForm promotion={promotion} products={products.map((p) => ({ slug: p.slug, name: p.name, categorySlug: p.categorySlug }))} /></Card>
    </>
  );
}
