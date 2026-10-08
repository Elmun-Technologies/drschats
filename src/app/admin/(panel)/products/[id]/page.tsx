import { notFound } from "next/navigation";
import { listBrands, listCategories, productFormValues } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice, PageHeader, dangerButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { deleteProduct } from "@/app/admin/_actions/catalog";
import { isStorageConfigured } from "@/lib/admin/storage";

export const metadata = { title: "Mahsulotni tahrirlash" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [values, cats, brandRows] = await Promise.all([productFormValues(decodeURIComponent(id)), listCategories(), listBrands()]);
  if (!values) notFound();

  return (
    <>
      <PageHeader
        title={values.content["uz.name"] || values.slug}
        lead={values.slug}
        actions={
          <div className="flex flex-wrap gap-2">
            <a href={`/uz/product/${values.slug}`} target="_blank" rel="noopener" className={secondaryButtonClass}>Saytda koʻrish ↗</a>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={values.id} />
              <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
            </form>
          </div>
        }
      />
      {saved && <div className="mb-4"><Notice tone="ok">Mahsulot yaratildi.</Notice></div>}
      <p className="mb-4 text-[13px] text-muted">Mahsulotni vaqtincha yashirish uchun oʻchirmang — «Holat»ni «Sotuvdan olingan» qiling: havolalar 404 ga aylanmaydi.</p>
      <ProductForm
        values={values}
        categories={cats.map((c) => ({ slug: c.slug, name: c.name.uz }))}
        brands={brandRows}
        storageReady={isStorageConfigured}
      />
    </>
  );
}
