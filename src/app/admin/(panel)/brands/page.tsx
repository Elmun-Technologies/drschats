import Link from "next/link";
import { count } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { listBrands } from "@/lib/admin/queries";
import { deleteBrand, saveBrand } from "@/app/admin/_actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, PageHeader, dangerButtonClass, inputClass, linkClass } from "@/components/admin/ui";
import { CatalogTabs } from "@/components/admin/catalog/CatalogTabs";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Brendlar");

export default async function AdminBrandsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const [rows, perBrand] = await Promise.all([
    listBrands(),
    getDb().select({ slug: products.brandSlug, n: count() }).from(products).groupBy(products.brandSlug),
  ]);
  const counts = new Map(perBrand.map((r) => [r.slug ?? "", r.n]));
  return (
    <>
      <CatalogTabs active="brands" />
      <PageHeader title={t("Brendlar")} lead={t("Brend sahifasi (/brands/…) unda mahsulot boʻlganda chiqadi. Mahsulotga brend uning tahrir sahifasida tanlanadi.")} />
      <div className="flex flex-col gap-4">
        {deleted && <Notice tone="ok">{t("Brend oʻchirildi; uning mahsulotlari brendsiz qoldi.")}</Notice>}
        <Card title={t("Yangi brend")}>
          <ActionForm action={saveBrand} className="grid gap-4 lg:grid-cols-3">
            <Field label={t("Nomi")}><input name="name" required className={inputClass} /></Field>
            <Field label={t("Slug")} hint={t("Boʻsh qolsa nomdan yaratiladi")}><input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} /></Field>
            <Field label={t("Tartib")}><input name="sort" type="number" defaultValue={0} className={inputClass} /></Field>
          </ActionForm>
        </Card>
        {rows.map((b) => {
          const n = counts.get(b.slug) ?? 0;
          return (
            <Card
              key={b.slug}
              title={b.name}
              lead={n > 0 ? `${n} ta mahsulot` : "Mahsulot yoʻq — saytda koʻrinmaydi"}
              actions={
                <div className="flex flex-wrap items-center gap-3">
                  {n > 0 && <Link href={`/admin/products?brand=${encodeURIComponent(b.slug)}`} className={`${linkClass} inline-flex h-11 items-center text-[14px]`}>{t("Mahsulotlar")}</Link>}
                  <form action={deleteBrand}>
                    <input type="hidden" name="slug" value={b.slug} />
                    <button type="submit" className={dangerButtonClass}>{t("Oʻchirish")}</button>
                  </form>
                </div>
              }
            >
              <ActionForm action={saveBrand} className="grid gap-4 lg:grid-cols-3">
                <Field label={t("Slug")} hint={t("Oʻzgarmaydi")}><input name="slug" defaultValue={b.slug} readOnly className={inputClass} /></Field>
                <Field label={t("Nomi")}><input name="name" defaultValue={b.name} required className={inputClass} /></Field>
                <Field label={t("Tartib")}><input name="sort" type="number" defaultValue={b.sort} className={inputClass} /></Field>
              </ActionForm>
            </Card>
          );
        })}
      </div>
    </>
  );
}
