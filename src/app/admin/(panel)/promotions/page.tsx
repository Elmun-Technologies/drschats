import Link from "next/link";
import { asc, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products, promotions } from "@/lib/db/schema";
import { rawPromotions } from "@/lib/shopflow/mock";
import { deletePromotion, importBuiltInPromotions, togglePromotion } from "@/app/admin/_actions/marketing";
import { ActionForm } from "@/components/admin/ActionForm";
import { PROMOTION_TYPE_LABEL } from "@/components/admin/PromotionForm";
import { Card, EmptyState, Notice, PageHeader, Pill, SectionTitle, TableWrap, buttonClass, linkClass, smallButtonClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/order-labels";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Aksiyalar" };

function status(p: typeof promotions.$inferSelect, now: number): { label: string; tone: "dark" | "outline" | "muted" } {
  if (!p.active) return { label: "Oʻchirilgan", tone: "muted" };
  if (p.startsAt && p.startsAt.getTime() > now) return { label: "Rejalashtirilgan", tone: "outline" };
  if (p.endsAt && p.endsAt.getTime() <= now) return { label: "Tugagan", tone: "muted" };
  return { label: "Faol", tone: "dark" };
}

export default async function AdminPromotionsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; imported?: string }> }) {
  const params = await searchParams;
  const db = getDb();
  const [rows, sales] = await Promise.all([
    db.select().from(promotions).orderBy(asc(promotions.sort), asc(promotions.createdAt)),
    db.select({ id: products.id, slug: products.slug, content: products.content, price: products.price, oldPrice: products.oldPrice, saleEndsAt: products.saleEndsAt }).from(products).where(isNotNull(products.oldPrice)).orderBy(asc(products.sort)),
  ]);
  const now = Date.now();

  return (
    <>
      <PageHeader
        title="Aksiyalar"
        lead="Butun sayt boʻyicha aksiyalar: foizli chegirma, 2+1, summadan bepul yetkazish. Saqlash bilan saytda, savatda va checkout narxida darhol amal qiladi."
        actions={<Link href="/admin/promotions/new" className={buttonClass}>+ Yangi aksiya</Link>}
      />
      {params.saved && <div className="mb-4"><Notice tone="ok">Aksiya saqlandi.</Notice></div>}
      {params.deleted && <div className="mb-4"><Notice tone="ok">Aksiya oʻchirildi.</Notice></div>}
      {params.imported && <div className="mb-4"><Notice tone="ok">{Number(params.imported) || 0} ta aksiya panelga olindi. Endi ularni tahrirlash yoki oʻchirish mumkin.</Notice></div>}

      {rows.length === 0 ? (
        <Card title="Hozir saytda ishlayotgan aksiyalar" lead="Panelda aksiya yaratilmaguncha sayt quyidagi oʻrnatilgan aksiyalarni qoʻllaydi. Ularni panelga olib, tahrirlash yoki oʻchirish mumkin.">
          <ul className="mb-4 flex flex-col gap-2">
            {rawPromotions.map((p) => (
              <li key={p.id} className="rounded-[14px] bg-tile p-4">
                <p className="text-[15px] font-semibold text-ink">{p.title.uz} <Pill tone="outline" className="ml-2">{PROMOTION_TYPE_LABEL[p.type as keyof typeof PROMOTION_TYPE_LABEL] ?? p.type}</Pill></p>
                <p className="mt-1 text-[14px] text-ink-2">{p.description.uz}</p>
                {p.type === "buy_x_get_y" && !p.productSlugs && <p className="mt-1 text-[13px] font-semibold text-ink">Diqqat: hozir barcha mahsulotlarga amal qiladi. Panelga olib, mahsulotlarni tanlang.</p>}
              </li>
            ))}
          </ul>
          <ActionForm action={importBuiltInPromotions} submitLabel="Panelga olish"><span /></ActionForm>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => {
            const s = status(p, now);
            return (
              <section key={p.id} className="flex flex-col rounded-[20px] bg-tile p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[17px] font-bold leading-6 text-ink">{p.title.uz}</h2>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </div>
                <p className="mt-1 text-[14px] text-ink-2">{PROMOTION_TYPE_LABEL[p.type]}{p.percent ? ` · −${p.percent}%` : ""}{p.threshold != null ? ` · ${som(p.threshold)} dan` : ""}</p>
                <p className="mt-1 flex-1 text-[13px] text-muted">
                  {p.productSlugs?.length ? `${p.productSlugs.length} ta mahsulot` : p.type === "free_shipping_over" ? "Butun savat" : "Barcha mahsulotlar"}
                  {p.startsAt ? ` · ${formatDateTime(p.startsAt)} dan` : ""}{p.endsAt ? ` · ${formatDateTime(p.endsAt)} gacha` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/promotions/${p.id}`} className={smallButtonClass}>Tahrirlash</Link>
                  <form action={togglePromotion}><input type="hidden" name="id" value={p.id} /><button type="submit" className={smallButtonClass}>{p.active ? "Oʻchirish" : "Yoqish"}</button></form>
                  <form action={deletePromotion}><input type="hidden" name="id" value={p.id} /><button type="submit" className="inline-flex h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-red hover:bg-white">Oʻchirib tashlash</button></form>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <SectionTitle actions={<Link href="/admin/products" className={linkClass}>Mahsulotlar</Link>}>Mahsulot chegirmalari</SectionTitle>
      <Card lead="Mahsulotning oʻzidagi eski narx va tugash muddati. Muddat oʻtgach narx avtomatik eski holiga qaytadi.">
        {sales.length === 0 ? (
          <EmptyState title="Chegirmadagi mahsulot yoʻq">Mahsulot sahifasida «Eski narx» va «Aksiya tugashi»ni toʻldiring.</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead><tr><th className={thClass}>Mahsulot</th><th className={`${thClass} text-right`}>Narx</th><th className={`${thClass} text-right`}>Eski narx</th><th className={`${thClass} text-right`}>Chegirma</th><th className={thClass}>Tugashi</th></tr></thead>
              <tbody>
                {sales.map((p) => (
                  <tr key={p.id}>
                    <td className={tdClass}><Link href={`/admin/products/${encodeURIComponent(p.id)}`} className={linkClass}>{p.content.name.uz}</Link></td>
                    <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{som(p.price)}</td>
                    <td className={`${tdClass} whitespace-nowrap text-right tabular-nums text-muted line-through`}>{som(p.oldPrice ?? 0)}</td>
                    <td className={`${tdClass} text-right`}>{p.oldPrice ? <Pill tone="red">−{formatNumber(Math.round((1 - p.price / p.oldPrice) * 100))}%</Pill> : null}</td>
                    <td className={`${tdClass} whitespace-nowrap text-ink-2`}>{p.saleEndsAt ? (p.saleEndsAt.getTime() < now ? "tugagan" : formatDateTime(p.saleEndsAt)) : "muddatsiz"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
