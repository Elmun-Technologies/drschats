import Link from "next/link";
import Image from "next/image";
import { listCategories, listProducts } from "@/lib/admin/queries";
import { builtInCatalogStatus } from "@/lib/admin/seed";
import { importBuiltInCatalog, toggleProductStock } from "@/app/admin/_actions/catalog";
import { Card, ChipNav, EmptyState, Notice, PageHeader, Pill, buttonClass, inputClass, secondaryButtonClass, som } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CatalogTabs } from "@/components/admin/catalog/CatalogTabs";
import { BuiltInSyncCard } from "@/components/admin/catalog/BuiltInSyncCard";
import { LowStockDefaultForm, StockButton } from "@/components/admin/catalog/StockControls";
import { readLowStockDefault } from "@/lib/catalog/stock";
import { isLowStock, stockLabel } from "@/lib/catalog/stock-rules";

export const metadata = { title: "Mahsulotlar" };

const FILTERS = {
  all: { label: "Hammasi", test: () => true },
  live: { label: "Sotuvda", test: (p: Row) => p.kind !== "unlisted" && p.inStock },
  out: { label: "Tugagan", test: (p: Row) => p.kind !== "unlisted" && !p.inStock },
  low: { label: "Kam qolganlar", test: (p: Row) => p.kind !== "unlisted" && isLowStock(p.stockQty, p.lowAt) },
  sale: { label: "Chegirmada", test: (p: Row) => Boolean(p.oldPrice) },
  noimage: { label: "Rasmsiz", test: (p: Row) => !p.cutout && p.images.length === 0 },
  hidden: { label: "Sotuvdan olingan", test: (p: Row) => p.kind === "unlisted" },
} as const;
type Filter = keyof typeof FILTERS;
type Row = Awaited<ReturnType<typeof listProducts>>[number] & { lowAt: number };

const SORTS = {
  order: { label: "Saytdagi tartib", compare: (a: Row, b: Row) => a.sort - b.sort || a.createdAt.getTime() - b.createdAt.getTime() },
  name: { label: "Nomi (A–Z)", compare: (a: Row, b: Row) => (a.name || a.slug).localeCompare(b.name || b.slug, "uz") },
  "price-asc": { label: "Arzonroq oldin", compare: (a: Row, b: Row) => a.price - b.price },
  "price-desc": { label: "Qimmatroq oldin", compare: (a: Row, b: Row) => b.price - a.price },
  new: { label: "Yangi qoʻshilgan", compare: (a: Row, b: Row) => b.createdAt.getTime() - a.createdAt.getTime() },
  updated: { label: "Oxirgi tahrirlangan", compare: (a: Row, b: Row) => b.updatedAt.getTime() - a.updatedAt.getTime() },
} as const;
type Sort = keyof typeof SORTS;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/* "3.0.0.2.0" → what the import did, in words; nothing when the param is malformed. */
function importedNotice(raw: string | undefined): string | null {
  if (!raw || !/^\d+(\.\d+){4}$/.test(raw)) return null;
  const [p, c, b, img, catImg] = raw.split(".").map(Number);
  const parts = [
    p > 0 && `${p} ta mahsulot`,
    c > 0 && `${c} ta kategoriya`,
    b > 0 && `${b} ta brend`,
  ].filter(Boolean);
  const filled = img + catImg;
  if (parts.length === 0 && filled === 0) return "Hammasi allaqachon panelda edi — hech narsa oʻzgarmadi.";
  return [
    parts.length > 0 && `Panelga olindi: ${parts.join(", ")}.`,
    filled > 0 && `${filled} ta yozuvning boʻsh rasmi toʻldirildi.`,
    "Mavjud mahsulotlar oʻzgartirilmadi.",
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; deleted?: string; filter?: string | string[]; category?: string | string[]; brand?: string | string[]; sort?: string | string[]; imported?: string }>;
}) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const filterParam = first(params.filter) ?? "all";
  const filter: Filter = filterParam in FILTERS ? (filterParam as Filter) : "all";
  const sortParam = first(params.sort) ?? "order";
  const sort: Sort = sortParam in SORTS ? (sortParam as Sort) : "order";
  const category = first(params.category) ?? "";
  const brand = first(params.brand) ?? "";
  const [rawRows, cats, status, lowStockDefault] = await Promise.all([listProducts(q), listCategories(), builtInCatalogStatus(), readLowStockDefault()]);
  const all: Row[] = rawRows.map((p) => ({ ...p, lowAt: p.lowStockAt ?? lowStockDefault }));
  const anyTracked = all.some((p) => p.stockQty != null);
  const catName = new Map(cats.map((c) => [c.slug, c.name.uz]));
  const inCategory = category === "none" ? all.filter((p) => !p.categorySlug || !catName.has(p.categorySlug)) : category ? all.filter((p) => p.categorySlug === category) : all;
  const rows = inCategory.filter((p) => !brand || p.brandSlug === brand).filter(FILTERS[filter].test).sort(SORTS[sort].compare);
  const imported = importedNotice(params.imported);
  const showSync = status.diff.pending > 0 || status.diff.backfillProducts.length > 0 || status.diff.backfillCategories.length > 0;
  const href = (next: { filter?: Filter }) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const f = next.filter ?? filter;
    if (f !== "all") search.set("filter", f);
    if (category) search.set("category", category);
    if (brand) search.set("brand", brand);
    if (sort !== "order") search.set("sort", sort);
    const text = search.toString();
    return `/admin/products${text ? `?${text}` : ""}`;
  };
  const filtered = Boolean(q || category || brand || sort !== "order");

  return (
    <>
      <CatalogTabs active="products" />
      <PageHeader
        title="Mahsulotlar"
        lead="Bu yerda qoʻshilgan yoki oʻzgartirilgan mahsulot saytda darhol koʻrinadi."
        actions={<Link href="/admin/products/new" className={buttonClass}>+ Yangi mahsulot</Link>}
      />
      {params.deleted && <div className="mb-4"><Notice tone="ok">Mahsulot oʻchirildi.</Notice></div>}
      {imported && <div className="mb-4"><Notice tone="ok">{imported}</Notice></div>}
      {showSync && <BuiltInSyncCard diff={status.diff} compact={status.empty} />}

      <form action="/admin/products" className="mb-4 grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap" role="search">
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        {brand && <input type="hidden" name="brand" value={brand} />}
        <input name="q" defaultValue={q} placeholder="Nomi yoki slug" aria-label="Mahsulot qidirish" className={`${inputClass} sm:col-span-2 lg:max-w-[320px]`} />
        <select name="category" defaultValue={category} aria-label="Kategoriya" className={`${inputClass} lg:max-w-[240px]`}>
          <option value="">Barcha kategoriyalar</option>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name.uz}</option>)}
          <option value="none">Kategoriyasiz</option>
        </select>
        <select name="sort" defaultValue={sort} aria-label="Saralash" className={`${inputClass} lg:max-w-[220px]`}>
          {(Object.keys(SORTS) as Sort[]).map((key) => <option key={key} value={key}>{SORTS[key].label}</option>)}
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className={`${buttonClass} flex-1 lg:flex-none`}>Koʻrsatish</button>
          {filtered && <Link href={`/admin/products${filter !== "all" ? `?filter=${filter}` : ""}`} className={`${secondaryButtonClass} flex-1 lg:flex-none`}>Tozalash</Link>}
        </div>
      </form>
      <ChipNav
        label="Holat boʻyicha"
        className="mb-4"
        items={(Object.keys(FILTERS) as Filter[])
          .filter((key) => key !== "noimage" || inCategory.some(FILTERS.noimage.test))
          .filter((key) => key !== "low" || anyTracked)
          .map((key) => ({ href: href({ filter: key }), label: FILTERS[key].label, active: key === filter, count: inCategory.filter(FILTERS[key].test).length }))}
      />
      <Card>
        {rows.length === 0 ? (
          all.length === 0 && !q ? (
            <EmptyState
              title="Panelda hali mahsulot yoʻq"
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <form action={importBuiltInCatalog}><SubmitButton pendingLabel="Olinmoqda…">Saytdagi mahsulotlarni olish</SubmitButton></form>
                  <Link href="/admin/products/new" className={secondaryButtonClass}>+ Yangi mahsulot</Link>
                </div>
              }
            >
              Saytdagi mahsulotlarni rasmlari bilan bir bosishda panelga olish mumkin.
            </EmptyState>
          ) : (
            <EmptyState title="Mahsulot topilmadi" action={<Link href="/admin/products/new" className={buttonClass}>+ Yangi mahsulot</Link>} />
          )
        ) : (
          <>
            <p className="mb-2 text-[13px] text-muted">{rows.length} ta mahsulot · {SORTS[sort].label.toLowerCase()}</p>
            <ul className="divide-y divide-line">
              {rows.map((p) => {
                const image = p.cutout ?? p.images[0];
                const cat = p.categorySlug ? catName.get(p.categorySlug) : undefined;
                return (
                  <li key={p.id} className="flex items-center gap-2">
                    <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="-mx-2 flex min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-3 hover:bg-tile sm:gap-4">
                      <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-tile">
                        {image ? (
                          <Image src={image} alt="" fill unoptimized={!image.startsWith("/")} sizes="64px" className="object-contain p-1.5" />
                        ) : (
                          <span className="text-[12px] text-muted">rasmsiz</span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="line-clamp-2 text-[15px] font-semibold leading-5 text-ink sm:truncate">{p.name || p.slug}</span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <Pill tone={cat ? "neutral" : "outline"}>{cat ?? "kategoriyasiz"}</Pill>
                          {p.kind === "unlisted" && <Pill tone="muted">sotuvdan olingan</Pill>}
                          {p.kind !== "unlisted" && !p.inStock && p.stockQty == null && <Pill tone="outline">tugagan</Pill>}
                          {p.stockQty != null && <Pill tone={stockLabel(p.stockQty, p.lowAt).tone} className="sm:hidden">{stockLabel(p.stockQty, p.lowAt).label}</Pill>}
                          {p.kind === "addon" && <Pill tone="muted">qoʻshimcha</Pill>}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-[14px] font-semibold tabular-nums text-ink sm:text-[15px]">
                        {som(p.price)}
                        {p.oldPrice && <span className="block text-[13px] font-normal text-muted line-through">{som(p.oldPrice)}</span>}
                      </span>
                    </Link>
                    <span className="hidden shrink-0 sm:block">
                      <StockButton id={p.id} name={p.name || p.slug} qty={p.stockQty} lowAt={p.lowAt} />
                    </span>
                    {(p.kind === "unlisted" || p.stockQty != null) && <span aria-hidden="true" className="hidden w-[136px] shrink-0 sm:block" />}
                    {p.kind !== "unlisted" && p.stockQty == null && (
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
          </>
        )}
      </Card>
      <Card title="Ombor" lead="«Ombordagi soni» kiritilgan mahsulotlarda buyurtma sonni kamaytiradi, bekor qilish qaytaradi; 0 boʻlsa mahsulot «tugagan» boʻladi. Soni kiritilmagan mahsulot avvalgidek ishlaydi." className="mt-5">
        <LowStockDefaultForm value={lowStockDefault} />
      </Card>
    </>
  );
}
