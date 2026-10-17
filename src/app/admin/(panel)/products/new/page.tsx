import { EMPTY_PRODUCT, listBrands, listCategories } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { isStorageConfigured } from "@/lib/admin/storage";
import { listRepoImages } from "@/lib/admin/repo-images.server";

export const metadata = { title: "Yangi mahsulot" };

export default async function NewProductPage() {
  const [cats, brandRows, repoImages] = await Promise.all([listCategories(), listBrands(), listRepoImages()]);
  return (
    <>
      <PageHeader eyebrow="Mahsulotlar" title="Yangi mahsulot" lead="Saqlangan zahoti saytda chiqadi. Avval yashirin saqlamoqchi boʻlsangiz, «Koʻrinishi»ni «Sotuvdan olingan» qiling." actions={<Link href="/admin/products" className={secondaryButtonClass}>← Roʻyxat</Link>} />
      <ProductForm
        values={EMPTY_PRODUCT}
        categories={cats.map((c) => ({ slug: c.slug, name: c.name.uz }))}
        brands={brandRows}
        storageReady={isStorageConfigured}
        repoImages={repoImages}
      />
    </>
  );
}
