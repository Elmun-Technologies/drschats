import Link from "next/link";
import { listProducts } from "@/lib/admin/queries";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Yangi aksiya");

export default async function NewPromotionPage() {
  await requireAdmin();
  const products = await listProducts();
  return (
    <>
      <PageHeader eyebrow={t("Aksiyalar")} title={t("Yangi aksiya")} actions={<Link href="/admin/promotions" className={secondaryButtonClass}>{t("← Aksiyalar")}</Link>} />
      <Card><PromotionForm products={products.map((p) => ({ slug: p.slug, name: p.name, categorySlug: p.categorySlug }))} /></Card>
    </>
  );
}
