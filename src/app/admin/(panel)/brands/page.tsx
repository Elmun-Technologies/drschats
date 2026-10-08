import { listBrands } from "@/lib/admin/queries";
import { deleteBrand, saveBrand } from "@/app/admin/_actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, PageHeader, dangerButtonClass, inputClass } from "@/components/admin/ui";

export const metadata = { title: "Brendlar" };

export default async function AdminBrandsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const rows = await listBrands();
  return (
    <>
      <PageHeader title="Brendlar" lead="Brend sahifasi (/brands/…) unda mahsulot boʻlganda chiqadi." />
      <div className="flex flex-col gap-4">
        {deleted && <Notice tone="ok">Brend oʻchirildi; uning mahsulotlari brendsiz qoldi.</Notice>}
        <Card title="Yangi brend">
          <ActionForm action={saveBrand} className="grid gap-4 lg:grid-cols-3">
            <Field label="Slug"><input name="slug" required className={inputClass} /></Field>
            <Field label="Nomi"><input name="name" required className={inputClass} /></Field>
            <Field label="Tartib"><input name="sort" type="number" defaultValue={0} className={inputClass} /></Field>
          </ActionForm>
        </Card>
        {rows.map((b) => (
          <Card
            key={b.slug}
            title={b.name}
            actions={
              <form action={deleteBrand}>
                <input type="hidden" name="slug" value={b.slug} />
                <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
              </form>
            }
          >
            <ActionForm action={saveBrand} className="grid gap-4 lg:grid-cols-3">
              <Field label="Slug" hint="Oʻzgarmaydi"><input name="slug" defaultValue={b.slug} readOnly className={inputClass} /></Field>
              <Field label="Nomi"><input name="name" defaultValue={b.name} required className={inputClass} /></Field>
              <Field label="Tartib"><input name="sort" type="number" defaultValue={b.sort} className={inputClass} /></Field>
            </ActionForm>
          </Card>
        ))}
      </div>
    </>
  );
}
