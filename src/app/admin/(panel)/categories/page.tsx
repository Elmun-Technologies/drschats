import { count, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { listCategories } from "@/lib/admin/queries";
import { deleteCategory, saveCategory } from "@/app/admin/_actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, PageHeader, dangerButtonClass, inputClass, textareaClass } from "@/components/admin/ui";

export const metadata = { title: "Kategoriyalar" };

type Row = Awaited<ReturnType<typeof listCategories>>[number];

function CategoryFields({ c }: { c?: Row }) {
  return (
    <>
      {c && <input type="hidden" name="original" value={c.slug} />}
      <Field label="Slug (URL)"><input name="slug" defaultValue={c?.slug} required className={inputClass} /></Field>
      <Field label="Tartib"><input name="sort" type="number" defaultValue={c?.sort ?? 0} className={inputClass} /></Field>
      <Field label="Nomi (uz)"><input name="uz.name" defaultValue={c?.name.uz} required className={inputClass} /></Field>
      <Field label="Nomi (ru)"><input name="ru.name" defaultValue={c?.name.ru} required className={inputClass} /></Field>
      <Field label="Tavsif (uz)"><textarea name="uz.description" defaultValue={c?.description.uz} rows={2} className={textareaClass} /></Field>
      <Field label="Tavsif (ru)"><textarea name="ru.description" defaultValue={c?.description.ru} rows={2} className={textareaClass} /></Field>
      <Field label="Rasm URL" className="lg:col-span-2"><input name="image" defaultValue={c?.image ?? ""} className={inputClass} /></Field>
    </>
  );
}

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ deleted?: string; blocked?: string }> }) {
  const { deleted, blocked } = await searchParams;
  const rows = await listCategories();
  const counts = await Promise.all(
    rows.map((c) => getDb().select({ n: count() }).from(products).where(eq(products.categorySlug, c.slug)).then(([r]) => r.n)),
  );

  return (
    <>
      <PageHeader title="Kategoriyalar" lead="Mahsulotsiz kategoriya saytda koʻrinmaydi (404) va menyuga chiqmaydi." />
      <div className="flex flex-col gap-4">
        {deleted && <Notice tone="ok">Kategoriya oʻchirildi.</Notice>}
        {blocked && <Notice tone="error">Kategoriyada mahsulot bor — avval mahsulotlarni boshqa kategoriyaga oʻtkazing.</Notice>}
        <Card title="Yangi kategoriya">
          <ActionForm action={saveCategory} className="grid gap-4 lg:grid-cols-2">
            <CategoryFields />
          </ActionForm>
        </Card>
        {rows.map((c, i) => (
          <Card
            key={c.slug}
            title={`${c.name.uz} · ${counts[i]} ta mahsulot`}
            actions={
              counts[i] === 0 ? (
                <form action={deleteCategory}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
                </form>
              ) : null
            }
          >
            <ActionForm action={saveCategory} className="grid gap-4 lg:grid-cols-2">
              <CategoryFields c={c} />
            </ActionForm>
          </Card>
        ))}
      </div>
    </>
  );
}
