import Image from "next/image";
import type { CatalogDiff } from "@/lib/admin/catalog-sync";
import { importBuiltInCatalog, dismissBuiltInImportAction } from "@/app/admin/_actions/catalog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { formatNumber } from "@/lib/utils";

/* One row of six tiles: all of them, or five and a "+ yana N ta" tile. */
const TILES = 6;

/*
  "The site has N products the panel does not": the built-in catalogue the
  storefront falls back to, compared by slug/id with the database. The button
  only inserts what is missing and fills photos where a product has none —
  nothing already in the panel is overwritten.
*/
export function BuiltInSyncCard({ diff, compact = false }: { diff: CatalogDiff; compact?: boolean }) {
  const missing = diff.missingProducts.length;
  const shown = missing <= TILES ? missing : TILES - 1;
  const extras = [
    diff.missingCategories.length > 0 && `${diff.missingCategories.length} ta kategoriya`,
    diff.missingBrands.length > 0 && `${diff.missingBrands.length} ta brend`,
  ].filter(Boolean);
  const backfill = diff.backfillProducts.length + diff.backfillCategories.length;
  const title =
    missing > 0
      ? `Saytdagi ${formatNumber(missing)} ta mahsulot hali panelda yoʻq`
      : extras.length > 0
        ? `Saytdagi ${extras.join(" va ")} hali panelda yoʻq`
        : `${formatNumber(backfill)} ta yozuvda rasm yoʻq — saytdagi rasmlar bor`;

  return (
    <section aria-labelledby="sync-title" className="mb-5 rounded-[20px] bg-dark-panel p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 id="sync-title" className="text-[20px] font-bold leading-7">{title}</h2>
          <p className="mt-1.5 text-[14px] leading-5 text-on-dark-2">
            {missing + extras.length > 0
              ? "Ular saytning oʻrnatilgan katalogida bor, lekin panelda yoʻq — shuning uchun ularni bu yerda tahrirlab boʻlmaydi."
              : "Bu mahsulotlarning paneldagi rasmi boʻsh, saytda esa ularning haqiqiy rasmlari bor."}
            {missing > 0 && extras.length > 0 && ` Shuningdek: ${extras.join(", ")}.`}
            {backfill > 0 && ` ${formatNumber(backfill)} ta mavjud yozuvning boʻsh rasmi saytdagi rasm bilan toʻldiriladi.`}
            {" "}Paneldagi mavjud maʼlumot ustidan yozilmaydi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={importBuiltInCatalog}>
            <SubmitButton pendingLabel="Olinmoqda…" className="bg-white text-ink hover:bg-tile">Panelga olish</SubmitButton>
          </form>
          {diff.pending > 0 && (
            <form action={dismissBuiltInImportAction}>
              <button
                type="submit"
                title="Ataylab oʻchirilgan boʻlsa — bu taklif qayta chiqmaydi"
                className="inline-flex h-12 items-center rounded-[12px] px-4 text-[15px] font-semibold text-on-dark-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Kerak emas
              </button>
            </form>
          )}
        </div>
      </div>
      {!compact && missing > 0 && (
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {diff.missingProducts.slice(0, shown).map((p) => {
            const image = p.cutout ?? p.images[0];
            return (
              <li key={p.slug} className="flex min-w-0 flex-col gap-1.5 rounded-[16px] bg-white/5 p-1.5 sm:p-2">
                <span className="relative block aspect-square overflow-hidden rounded-[12px] bg-white">
                  {image && <Image src={image} alt="" fill sizes="(min-width: 1024px) 160px, 30vw" className="object-contain p-2" />}
                </span>
                <span className="line-clamp-2 px-0.5 text-[12px] font-semibold leading-4 sm:text-[13px] sm:leading-[18px]">{p.name}</span>
              </li>
            );
          })}
          {missing > shown && (
            <li className="grid min-h-24 place-items-center rounded-[16px] bg-white/5 p-2 text-center text-[14px] font-semibold">
              + yana {formatNumber(missing - shown)} ta
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
