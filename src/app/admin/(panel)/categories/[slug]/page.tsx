import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, productCountsByCategory } from "@/lib/admin/queries";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { deleteCategory } from "@/app/admin/_actions/catalog";
import { Notice, PageHeader, dangerButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/catalog/CategoryForm";

export const metadata = { title: "Kategoriyani tahrirlash" };

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string; blocked?: string }> }) {
  const [{ slug }, { saved, blocked }] = await Promise.all([params, searchParams]);
  const [category, counts, repoImages] = await Promise.all([getCategory(decodeURIComponent(slug)), productCountsByCategory(), listRepoImages()]);
  if (!category) notFound();
  const n = counts.get(category.slug)?.total ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Kategoriyalar"
        title={category.name.uz}
        lead={n > 0 ? `${n} ta mahsulot` : "Hali mahsulot yoʻq — saytda koʻrinmaydi"}
        actions={<>
          {n > 0 && <a href={`/uz/products/${category.slug}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>Saytda koʻrish ↗</a>}
          <Link href={`/admin/products?category=${encodeURIComponent(category.slug)}`} className={secondaryButtonClass}>Mahsulotlar</Link>
          <Link href="/admin/categories" className={secondaryButtonClass}>← Kategoriyalar</Link>
        </>}
      />
      {saved && <div className="mb-4"><Notice tone="ok">Saqlandi. Kategoriya manzili oʻzgardi — mahsulotlari ham oʻtdi.</Notice></div>}
      {blocked && <div className="mb-4"><Notice tone="error">Kategoriyada mahsulot bor — avval mahsulotlarni boshqa kategoriyaga oʻtkazing.</Notice></div>}
      <CategoryForm
        key={category.slug}
        editing
        repoImages={repoImages}
        values={{
          slug: category.slug,
          uzName: category.name.uz,
          ruName: category.name.ru,
          uzDescription: category.description.uz,
          ruDescription: category.description.ru,
          image: category.image ?? "",
          sort: category.sort,
        }}
      />
      <section className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-red/25 p-5">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-ink">Kategoriyani oʻchirish</h2>
          <p className="mt-1 max-w-2xl text-[14px] text-ink-2">
            {n > 0 ? `Unda ${n} ta mahsulot bor — avval ularni boshqa kategoriyaga oʻtkazing.` : "Qaytarib boʻlmaydi. Mahsulot yoʻq, shuning uchun hech narsa yoʻqolmaydi."}
          </p>
        </div>
        {n === 0 && (
          <form action={deleteCategory}>
            <input type="hidden" name="slug" value={category.slug} />
            <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
          </form>
        )}
      </section>
    </>
  );
}
