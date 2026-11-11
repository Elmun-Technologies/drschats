import Link from "next/link";
import { listCategories } from "@/lib/admin/queries";
import { listRepoImages } from "@/lib/admin/repo-images.server";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/catalog/CategoryForm";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Yangi kategoriya");

export default async function NewCategoryPage() {
  await requireAdmin();
  const [cats, repoImages] = await Promise.all([listCategories(), listRepoImages()]);
  const nextSort = cats.reduce((max, c) => Math.max(max, c.sort), -1) + 1;
  return (
    <>
      <PageHeader
        eyebrow={t("Kategoriyalar")}
        title={t("Yangi kategoriya")}
        lead={t("Kategoriya saytda unga birinchi mahsulot qoʻshilganda chiqadi — boʻsh javon menyuda koʻrinmaydi.")}
        actions={<Link href="/admin/categories" className={secondaryButtonClass}>{t("← Kategoriyalar")}</Link>}
      />
      <CategoryForm
        editing={false}
        repoImages={repoImages}
        values={{ slug: "", uzName: "", ruName: "", uzDescription: "", ruDescription: "", image: "", sort: nextSort }}
      />
    </>
  );
}
