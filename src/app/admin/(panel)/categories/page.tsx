import Image from "next/image";
import Link from "next/link";
import { listCategories, productCountsByCategory } from "@/lib/admin/queries";
import { EmptyState, Notice, PageHeader, Pill, buttonClass, smallButtonClass } from "@/components/admin/ui";
import { CatalogTabs } from "@/components/admin/catalog/CatalogTabs";

export const metadata = { title: "Kategoriyalar" };

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ deleted?: string; created?: string }> }) {
  const { deleted, created } = await searchParams;
  const [rows, counts] = await Promise.all([listCategories(), productCountsByCategory()]);
  const createdName = created ? rows.find((c) => c.slug === created)?.name.uz : undefined;
  const known = new Set(rows.map((c) => c.slug));
  const orphans = [...counts.entries()].filter(([slug]) => !known.has(slug)).reduce((n, [, c]) => n + c.total, 0);

  return (
    <>
      <CatalogTabs active="categories" />
      <PageHeader
        title="Kategoriyalar"
        lead="Mahsulotsiz kategoriya saytda koʻrinmaydi (404) va menyuga chiqmaydi — birinchi mahsulot qoʻshilishi bilan oʻzi chiqadi."
        actions={<Link href="/admin/categories/new" className={buttonClass}>+ Yangi kategoriya</Link>}
      />
      <div className="mb-4 flex flex-col gap-3 empty:hidden">
        {deleted && <Notice tone="ok">Kategoriya oʻchirildi.</Notice>}
        {createdName && <Notice tone="ok">«{createdName}» kategoriyasi yaratildi. Endi unga mahsulot qoʻshing — shunda saytda chiqadi.</Notice>}
        {orphans > 0 && (
          <Notice>
            {orphans} ta mahsulot kategoriyasiz — saytning kategoriya sahifalarida chiqmaydi.{" "}
            <Link href="/admin/products?category=none" className="font-semibold text-ink underline underline-offset-4">Koʻrish</Link>
          </Notice>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Hali kategoriya yoʻq" action={<Link href="/admin/categories/new" className={buttonClass}>+ Yangi kategoriya</Link>} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map((c) => {
            const n = counts.get(c.slug) ?? { total: 0, live: 0 };
            const edit = `/admin/categories/${encodeURIComponent(c.slug)}`;
            return (
              <li key={c.slug} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white">
                  <Link href={edit} aria-label={`${c.name.uz} — tahrirlash`} className="relative block aspect-[2/1] bg-tile sm:aspect-[16/10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30">
                    {c.image ? (
                      <Image src={c.image} alt="" fill unoptimized={!c.image.startsWith("/")} sizes="(min-width: 1536px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-contain p-4 sm:p-5" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-[14px] text-muted">Rasm yoʻq</span>
                    )}
                    {n.total === 0 && <span className="absolute left-3 top-3"><Pill tone="outline">saytda koʻrinmaydi</Pill></span>}
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-[17px] font-bold leading-6 text-ink">{c.name.uz}</h2>
                      <p className="truncate text-[14px] text-muted">{c.name.ru} · /{c.slug}</p>
                    </div>
                    <p className="text-[14px] text-ink-2">
                      <span className="font-semibold tabular-nums text-ink">{n.total}</span> ta mahsulot
                      {n.total > 0 && n.live !== n.total && <span className="text-muted"> · sotuvda {n.live}</span>}
                    </p>
                    <div className="mt-auto flex gap-2">
                      <Link href={`/admin/products?category=${encodeURIComponent(c.slug)}`} className={`${smallButtonClass} flex-1`}>Mahsulotlar</Link>
                      <Link href={edit} className={`${smallButtonClass} flex-1`}>Tahrirlash</Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
          <li className="h-full">
            <Link
              href="/admin/categories/new"
              className="flex h-full min-h-[120px] sm:min-h-[200px] flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-line-strong p-5 text-center text-[15px] font-semibold text-ink transition-colors hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              <span aria-hidden="true" className="text-[28px] leading-none">+</span>
              Yangi kategoriya
            </Link>
          </li>
        </ul>
      )}
    </>
  );
}
