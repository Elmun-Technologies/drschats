import Link from "next/link";
import Image from "next/image";
import { listCategories, listProducts } from "@/lib/admin/queries";
import { toggleProductStock } from "@/app/admin/_actions/catalog";
import { Card, ChipNav, EmptyState, Notice, PageHeader, Pill, buttonClass, inputClass, secondaryButtonClass, som } from "@/components/admin/ui";

export const metadata = { title: "Mahsulotlar" };

const FILTERS = {
  all: { label: "Hammasi", test: () => true },
  live: { label: "Sotuvda", test: (p: Row) => p.kind !== "unlisted" && p.inStock },
  out: { label: "Tugagan", test: (p: Row) => p.kind !== "unlisted" && !p.inStock },
  sale: { label: "Chegirmada", test: (p: Row) => Boolean(p.oldPrice) },
  hidden: { label: "Sotuvdan olingan", test: (p: Row) => p.kind === "unlisted" },
} as const;
type Filter = keyof typeof FILTERS;
type Row = Awaited<ReturnType<typeof listProducts>>[number];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; deleted?: string; filter?: string | string[]; category?: string | string[] }> }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const filterParam = first(params.filter) ?? "all";
  const filter: Filter = filterParam in FILTERS ? (filterParam as Filter) : "all";
  const category = first(params.category) ?? "";
  const [all, cats] = await Promise.all([listProducts(q), listCategories()]);
  const catName = new Map(cats.map((c) => [c.slug, c.name.uz]));
  const inCategory = category ? all.filter((p) => p.categorySlug === category) : all;
  const rows = inCategory.filter(FILTERS[filter].test);
  const href = (next: { filter?: Filter; category?: string }) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const f = next.filter ?? filter;
    if (f !== "all") search.set("filter", f);
    const c = next.category ?? category;
    if (c) search.set("category", c);
    const text = search.toString();
    return `/admin/products${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Mahsulotlar"
        lead="Bu yerda qoʻshilgan yoki oʻzgartirilgan mahsulot saytda darhol koʻrinadi."
        actions={<Link href="/admin/products/new" className={buttonClass}>+ Yangi mahsulot</Link>}
      />
      {params.deleted && <div className="mb-4"><Notice tone="ok">Mahsulot oʻchirildi.</Notice></div>}
      <form action="/admin/products" className="mb-4 flex flex-wrap gap-2" role="search">
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        <input name="q" defaultValue={q} placeholder="Nomi yoki slug" aria-label="Mahsulot qidirish" className={`${inputClass} max-w-[360px]`} />
        <select name="category" defaultValue={category} aria-label="Kategoriya" className={`${inputClass} max-w-[260px]`}>
          <option value="">Barcha kategoriyalar</option>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name.uz}</option>)}
        </select>
        <button type="submit" className={buttonClass}>Koʻrsatish</button>
        {(q || category) && <Link href={`/admin/products${filter !== "all" ? `?filter=${filter}` : ""}`} className={secondaryButtonClass}>Tozalash</Link>}
      </form>
      <ChipNav
        label="Holat boʻyicha"
        className="mb-4"
        items={(Object.keys(FILTERS) as Filter[]).map((key) => ({ href: href({ filter: key }), label: FILTERS[key].label, active: key === filter, count: inCategory.filter(FILTERS[key].test).length }))}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Mahsulot topilmadi" action={<Link href="/admin/products/new" className={buttonClass}>+ Yangi mahsulot</Link>} />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((p) => {
              const image = p.cutout ?? p.images[0];
              return (
                <li key={p.id} className="flex items-center gap-2">
                  <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="-mx-2 flex min-w-0 flex-1 items-center gap-4 rounded-[12px] px-2 py-3 hover:bg-tile">
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-tile">
                      {image && <Image src={image} alt="" fill sizes="64px" className="object-contain p-1.5" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-[15px] font-semibold text-ink">{p.name || p.slug}</span>
                      <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                        {catName.get(p.categorySlug ?? "") ?? "kategoriyasiz"}
                        {p.kind === "unlisted" && <Pill tone="muted">sotuvdan olingan</Pill>}
                        {p.kind !== "unlisted" && !p.inStock && <Pill tone="outline">tugagan</Pill>}
                        {p.kind === "addon" && <Pill>qoʻshimcha</Pill>}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-[15px] font-semibold tabular-nums text-ink">
                      {som(p.price)}
                      {p.oldPrice && <span className="block text-[13px] font-normal text-muted line-through">{som(p.oldPrice)}</span>}
                    </span>
                  </Link>
                  {p.kind !== "unlisted" && (
                    <form action={toggleProductStock} className="hidden shrink-0 sm:block">
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="h-11 w-[136px] rounded-[12px] bg-tile text-[14px] font-semibold text-ink hover:bg-tile-hover" title={p.inStock ? "Tugadi deb belgilash" : "Omborda bor deb belgilash"}>
                        {p.inStock ? "Tugadi" : "Omborga keldi"}
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
