import Link from "next/link";
import { asc, desc, gt, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { deals, products } from "@/lib/db/schema";
import { deleteDeal, endDealNow } from "@/app/admin/_actions/storefront";
import { dealRunning, discounted } from "@/lib/catalog/deals";
import { livePrice } from "@/lib/shop/sale";
import { tashkentEndOfDay } from "@/lib/merch/model";
import { toTashkentInput } from "@/lib/admin/product-form";
import { formatDateTime } from "@/lib/admin/order-labels";
import { StorefrontTabs } from "@/components/admin/storefront/StorefrontTabs";
import { DealForm, type DealFormValues } from "@/components/admin/storefront/DealForm";
import { Card, EmptyState, Notice, PageHeader, Pill, SectionTitle, TableWrap, linkClass, smallButtonClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Bugungi taklif");

type DealRow = typeof deals.$inferSelect;

export default async function DealOfDayPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; ended?: string; edit?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const db = getDb();
  const [upcoming, past, catalogue] = await Promise.all([
    db.select().from(deals).where(gt(deals.endsAt, sql`now()`)).orderBy(asc(deals.startsAt)),
    db.select().from(deals).where(lte(deals.endsAt, sql`now()`)).orderBy(desc(deals.endsAt)).limit(10),
    db
      .select({ slug: products.slug, name: sql<string>`${products.content}->'name'->>'uz'`, price: products.price, oldPrice: products.oldPrice, saleEndsAt: products.saleEndsAt, inStock: products.inStock, kind: products.kind })
      .from(products)
      .orderBy(asc(products.sort), asc(products.createdAt)),
  ]);
  const now = Date.now();
  const iso = (d: DealRow) => ({ startsAt: d.startsAt.toISOString(), endsAt: d.endsAt.toISOString() });
  const current = upcoming.find((d) => dealRunning(iso(d), now));
  const queue = upcoming.filter((d) => d !== current);
  // The price each product sells at today, before any deal.
  const base = new Map(
    catalogue.map((p) => [p.slug, livePrice({ price: p.price, oldPrice: p.oldPrice ?? undefined, saleEndsAt: p.saleEndsAt?.toISOString() }, now).price]),
  );
  const names = new Map(catalogue.map((p) => [p.slug, p.name]));
  const options = catalogue.filter((p) => p.inStock && p.kind !== "unlisted").map((p) => ({ slug: p.slug, name: p.name, price: base.get(p.slug)! }));

  const editing = params.edit ? upcoming.find((d) => d.id === Number(params.edit)) : undefined;
  const lastEnd = upcoming.at(-1)?.endsAt;
  const values: DealFormValues = editing
    ? {
        id: editing.id,
        productSlug: editing.productSlug,
        mode: editing.price != null ? "price" : "percent",
        percent: editing.percent != null ? String(editing.percent) : "",
        price: editing.price != null ? String(editing.price) : "",
        startsAt: toTashkentInput(editing.startsAt),
        endsAt: toTashkentInput(editing.endsAt),
      }
    : {
        productSlug: "",
        mode: "percent",
        percent: "15",
        price: "",
        // Next free slot: after the last scheduled deal, or now until 23:59 today.
        startsAt: lastEnd ? toTashkentInput(lastEnd) : "",
        endsAt: toTashkentInput(tashkentEndOfDay(lastEnd ? lastEnd.getTime() + 60_000 : now)),
      };

  const priceOf = (d: DealRow) => {
    const b = base.get(d.productSlug) ?? 0;
    return { base: b, deal: discounted(b, d) };
  };
  const terms = (d: DealRow) => (d.percent != null ? `−${d.percent}%` : t("Yangi narx"));

  return (
    <>
      <PageHeader
        title={t("Vitrina")}
        lead={t("Bugungi taklif — bitta mahsulot, cheklangan vaqtga haqiqiy past narx. Narx jadval boʻyicha oʻz vaqtida oʻzi oʻzgaradi va oʻzi qaytadi: saytda, savatda va buyurtmada bir xil.")}
      />
      <StorefrontTabs active="deal" />
      {params.saved && <div className="mb-4"><Notice tone="ok">{t("Taklif saqlandi.")}</Notice></div>}
      {params.deleted && <div className="mb-4"><Notice tone="ok">{t("Taklif oʻchirildi.")}</Notice></div>}
      {params.ended && <div className="mb-4"><Notice tone="ok">{t("Taklif tugatildi — mahsulot odatiy narxida.")}</Notice></div>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title={t("Hozir saytda")}>
          {current ? (
            (() => {
              const p = priceOf(current);
              return (
                <div className="flex flex-col gap-3">
                  <p className="text-[17px] font-bold text-ink">{names.get(current.productSlug) ?? current.productSlug}</p>
                  <p className="flex flex-wrap items-baseline gap-2 text-[15px]">
                    {p.deal != null ? (
                      <>
                        <b className="text-[22px] text-ink">{som(p.deal)}</b>
                        <span className="text-muted line-through">{som(p.base)}</span>
                        <Pill tone="red">−{Math.round((1 - p.deal / p.base) * 100)}%</Pill>
                      </>
                    ) : (
                      <span className="text-ink-2">{t("Narx hozirgi narxdan past emas — taklif amal qilmayapti ({terms}).", { terms: terms(current) })}</span>
                    )}
                  </p>
                  <p className="text-[14px] text-ink-2">{t("{start} — {end} gacha", { start: formatDateTime(current.startsAt), end: formatDateTime(current.endsAt) })}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/storefront/deal?edit=${current.id}`} className={smallButtonClass}>{t("Tahrirlash")}</Link>
                    <form action={endDealNow}>
                      <input type="hidden" name="id" value={current.id} />
                      <button type="submit" className={smallButtonClass}>{t("Hozir tugatish")}</button>
                    </form>
                  </div>
                </div>
              );
            })()
          ) : (
            <EmptyState title={t("Hozir taklif yoʻq")}>{t("Bosh sahifada «Bugungi taklif» bloki koʻrinmaydi. Oʻngdagi forma bilan rejalashtiring.")}</EmptyState>
          )}
        </Card>

        <Card title={editing ? t("Taklifni tahrirlash") : t("Yangi taklif")} lead={t("Bir vaqtda bitta taklif: vaqtlar ustma-ust tushmasin. Kelgusi kunlar uchun ham navbatga qoʻyish mumkin.")} actions={editing ? <Link href="/admin/storefront/deal" className={linkClass}>{t("Bekor qilish")}</Link> : undefined}>
          <DealForm key={editing?.id ?? "new"} values={values} products={options} />
        </Card>
      </div>

      <SectionTitle>{t("Navbat")}</SectionTitle>
      <Card>
        {queue.length === 0 ? (
          <EmptyState title={t("Navbatda taklif yoʻq")} />
        ) : (
          <DealTable rows={queue} names={names} priceOf={priceOf} terms={terms} actions />
        )}
      </Card>

      {past.length > 0 && (
        <>
          <SectionTitle>{t("Oʻtgan takliflar")}</SectionTitle>
          <Card>
            <DealTable rows={past} names={names} priceOf={priceOf} terms={terms} />
          </Card>
        </>
      )}
    </>
  );
}

function DealTable({
  rows,
  names,
  priceOf,
  terms,
  actions = false,
}: {
  rows: DealRow[];
  names: Map<string, string>;
  priceOf: (d: DealRow) => { base: number; deal: number | null };
  terms: (d: DealRow) => string;
  actions?: boolean;
}) {
  return (
    <TableWrap>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>{t("Vaqt (Toshkent)")}</th>
            <th className={thClass}>{t("Mahsulot")}</th>
            <th className={thClass}>{t("Chegirma")}</th>
            <th className={`${thClass} text-right`}>{t("Narx")}</th>
            {actions && <th className={thClass}><span className="sr-only">{t("Amallar")}</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const p = priceOf(d);
            return (
              <tr key={d.id}>
                <td className={`${tdClass} whitespace-nowrap text-[13px] text-ink-2`}>{formatDateTime(d.startsAt)} — {formatDateTime(d.endsAt)}</td>
                <td className={tdClass}>{names.get(d.productSlug) ?? d.productSlug}</td>
                <td className={tdClass}>{terms(d)}</td>
                <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{p.deal != null ? som(p.deal) : "—"}</td>
                {actions && (
                  <td className={tdClass}>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/storefront/deal?edit=${d.id}`} className={smallButtonClass}>{t("Tahrirlash")}</Link>
                      <form action={deleteDeal}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="inline-flex h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-red hover:bg-tile">{t("Oʻchirish")}</button>
                      </form>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrap>
  );
}
