import Link from "next/link";
import { listProducts } from "@/lib/admin/queries";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Yangi promokod");

export default async function NewPromoCodePage() {
  await requireAdmin();
  const products = await listProducts();
  return (
    <>
      <PageHeader eyebrow={t("Promokodlar")} title={t("Yangi promokod")} actions={<Link href="/admin/promocodes" className={secondaryButtonClass}>{t("← Promokodlar")}</Link>} />
      <Card><PromoCodeForm products={products.map((p) => ({ slug: p.slug, name: p.name }))} /></Card>
    </>
  );
}
