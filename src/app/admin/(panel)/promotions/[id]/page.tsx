import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { promotions } from "@/lib/db/schema";
import { listProducts } from "@/lib/admin/queries";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Aksiya");

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [[promotion], products] = await Promise.all([getDb().select().from(promotions).where(eq(promotions.id, id)).limit(1), listProducts()]);
  if (!promotion) notFound();
  return (
    <>
      <PageHeader eyebrow={t("Aksiyalar")} title={promotion.title.uz} actions={<Link href="/admin/promotions" className={secondaryButtonClass}>{t("← Aksiyalar")}</Link>} />
      <Card><PromotionForm promotion={promotion} products={products.map((p) => ({ slug: p.slug, name: p.name, categorySlug: p.categorySlug }))} /></Card>
    </>
  );
}
