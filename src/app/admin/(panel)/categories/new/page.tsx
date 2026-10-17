import Link from "next/link";
import { listCategories } from "@/lib/admin/queries";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/catalog/CategoryForm";

export const metadata = { title: "Yangi kategoriya" };

export default async function NewCategoryPage() {
  const [cats, repoImages] = await Promise.all([listCategories(), listRepoImages()]);
  const nextSort = cats.reduce((max, c) => Math.max(max, c.sort), -1) + 1;
  return (
    <>
      <PageHeader
        eyebrow="Kategoriyalar"
        title="Yangi kategoriya"
        lead="Kategoriya saytda unga birinchi mahsulot qoʻshilganda chiqadi — boʻsh javon menyuda koʻrinmaydi."
        actions={<Link href="/admin/categories" className={secondaryButtonClass}>← Kategoriyalar</Link>}
      />
      <CategoryForm
        editing={false}
        repoImages={repoImages}
        values={{ slug: "", uzName: "", ruName: "", uzDescription: "", ruDescription: "", image: "", sort: nextSort }}
      />
    </>
  );
}
