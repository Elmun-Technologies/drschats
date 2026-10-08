import Link from "next/link";
import Image from "next/image";
import { listCategories, listProducts } from "@/lib/admin/queries";
import { Card, Notice, PageHeader, Pill, buttonClass, inputClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Mahsulotlar" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; deleted?: string }> }) {
  const { q, deleted } = await searchParams;
  const [rows, cats] = await Promise.all([listProducts(q), listCategories()]);
  const catName = new Map(cats.map((c) => [c.slug, c.name.uz]));

  return (
    <>
      <PageHeader
        title="Mahsulotlar"
        lead={`${rows.length} ta${q ? ` · «${q}» boʻyicha` : ""}`}
        actions={<Link href="/admin/products/new" className={buttonClass}>+ Yangi mahsulot</Link>}
      />
      {deleted && <div className="mb-4"><Notice tone="ok">Mahsulot oʻchirildi.</Notice></div>}
      <Card>
        <form className="mb-4 flex gap-2" role="search">
          <input name="q" defaultValue={q} placeholder="Nomi yoki slug boʻyicha qidirish" aria-label="Qidirish" className={inputClass} />
        </form>
        {rows.length === 0 ? (
          <p className="text-[15px] text-ink-2">Mahsulot yoʻq. Bosh sahifadagi «Katalogni import qilish» tugmasi bilan mavjud katalogni koʻchiring.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((p) => {
              const image = p.cutout ?? p.images[0];
              return (
                <li key={p.id}>
                  <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="flex items-center gap-4 py-3 hover:bg-tile/60">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-tile">
                      {image && <Image src={image} alt="" fill sizes="56px" className="object-contain p-1" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-[15px] font-semibold">{p.name || p.slug}</span>
                      <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                        {catName.get(p.categorySlug ?? "") ?? "— kategoriyasiz"}
                        {p.kind === "unlisted" && <Pill tone="red">sotuvda emas</Pill>}
                        {!p.inStock && <Pill>tugagan</Pill>}
                        {p.kind === "addon" && <Pill>qoʻshimcha</Pill>}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-[15px] font-semibold">
                      {formatNumber(p.price)} soʻm
                      {p.oldPrice && <span className="block text-[13px] font-normal text-muted line-through">{formatNumber(p.oldPrice)}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
