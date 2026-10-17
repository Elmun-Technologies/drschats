import Link from "next/link";
import { notFound } from "next/navigation";
import { listBrands, listCategories, productFormValues } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice, PageHeader, dangerButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { deleteProduct, duplicateProduct } from "@/app/admin/_actions/catalog";
import { isStorageConfigured } from "@/lib/admin/storage";
import { listRepoImages } from "@/lib/admin/repo-images.server";

export const metadata = { title: "Mahsulotni tahrirlash" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; copied?: string }> }) {
  const [{ id }, { saved, copied }] = await Promise.all([params, searchParams]);
  const [values, cats, brandRows, repoImages] = await Promise.all([productFormValues(decodeURIComponent(id)), listCategories(), listBrands(), listRepoImages()]);
  if (!values) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Mahsulotlar"
        title={values.content["uz.name"] || values.slug}
        actions={<>
          <a href={`/uz/product/${values.slug}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>Saytda koʻrish ↗</a>
          <form action={duplicateProduct}>
            <input type="hidden" name="id" value={values.id} />
            <button type="submit" className={secondaryButtonClass}>Nusxa olish</button>
          </form>
          <Link href="/admin/products" className={secondaryButtonClass}>← Roʻyxat</Link>
        </>}
      />
      {saved && <div className="mb-4"><Notice tone="ok">Mahsulot yaratildi va saytda koʻrinadi.</Notice></div>}
      {copied && <div className="mb-4"><Notice tone="ok">Nusxa yaratildi. U «Sotuvdan olingan» holatida — tahrirlab, holatini «Asosiy assortiment» qiling.</Notice></div>}
      <ProductForm
        values={values}
        categories={cats.map((c) => ({ slug: c.slug, name: c.name.uz }))}
        brands={brandRows}
        storageReady={isStorageConfigured}
        repoImages={repoImages}
      />
      <section className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-red/25 p-5">
        <div>
          <h2 className="text-[17px] font-bold text-ink">Mahsulotni oʻchirish</h2>
          <p className="mt-1 max-w-2xl text-[14px] text-ink-2">Qaytarib boʻlmaydi va eski havolalar 404 ga aylanadi. Vaqtincha yashirish uchun «Koʻrinishi» → «Sotuvdan olingan» qiling.</p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={values.id} />
          <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
        </form>
      </section>
    </>
  );
}
