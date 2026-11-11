import { EMPTY_PRODUCT, listBrands, listCategories } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { isStorageConfigured } from "@/lib/admin/storage";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { readLowStockDefault } from "@/lib/catalog/stock";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Yangi mahsulot");

export default async function NewProductPage() {
  await requireAdmin();
  const [cats, brandRows, repoImages, lowStockDefault] = await Promise.all([listCategories(), listBrands(), listRepoImages(), readLowStockDefault()]);
  return (
    <>
      <PageHeader eyebrow={t("Mahsulotlar")} title={t("Yangi mahsulot")} lead={t("Saqlangan zahoti saytda chiqadi. Avval yashirin saqlamoqchi boʻlsangiz, «Koʻrinishi»ni «Sotuvdan olingan» qiling.")} actions={<Link href="/admin/products" className={secondaryButtonClass}>{t("← Roʻyxat")}</Link>} />
      <ProductForm
        values={EMPTY_PRODUCT}
        categories={cats.map((c) => ({ slug: c.slug, name: c.name.uz }))}
        brands={brandRows}
        storageReady={isStorageConfigured}
        repoImages={repoImages}
        lowStockDefault={lowStockDefault}
      />
    </>
  );
}
