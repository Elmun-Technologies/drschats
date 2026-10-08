import { EMPTY_PRODUCT, listBrands, listCategories } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { isStorageConfigured } from "@/lib/admin/storage";

export const metadata = { title: "Yangi mahsulot" };

export default async function NewProductPage() {
  const [cats, brandRows] = await Promise.all([listCategories(), listBrands()]);
  return (
    <>
      <PageHeader title="Yangi mahsulot" />
      <ProductForm
        values={EMPTY_PRODUCT}
        categories={cats.map((c) => ({ slug: c.slug, name: c.name.uz }))}
        brands={brandRows}
        storageReady={isStorageConfigured}
      />
    </>
  );
}
