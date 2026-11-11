import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { promoCodes, type OrderStatus } from "@/lib/db/schema";
import { listProducts } from "@/lib/admin/queries";
import { SOURCE_LABEL, promoRedemptionsOf, promoValueLabel } from "@/lib/admin/promocodes";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { deletePromoCode, togglePromoCode } from "@/app/admin/_actions/promocodes";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { CopyButton } from "@/components/admin/CopyButton";
import { Card, EmptyState, Notice, PageHeader, Pill, TableWrap, dangerButtonClass, linkClass, secondaryButtonClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Promokod");

export default async function PromoCodePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ inUse?: string }> }) {
  await requireAdmin();
  const { code: raw } = await params;
  const { inUse } = await searchParams;
  const code = decodeURIComponent(raw);
  const [[promo], products, redemptions] = await Promise.all([
    getDb().select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1),
    listProducts(),
    promoRedemptionsOf(code),
  ]);
  if (!promo) notFound();
  const live = redemptions.filter((r) => r.status !== "cancelled");
  const revenue = live.reduce((sum, r) => sum + r.total, 0);
  const given = live.reduce((sum, r) => sum + r.discount, 0);

  return (
    <>
      <PageHeader
        eyebrow={`Promokodlar · ${SOURCE_LABEL[promo.source]}${promo.campaignId ? ` · ${promo.campaignId}` : ""}`}
        title={promo.code}
        lead={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Pill tone={promo.active ? "dark" : "muted"}>{promo.active ? "Faol" : "Oʻchirilgan"}</Pill>
            <span>{promoValueLabel(promo.kind, promo.value)} {t("· ishlatildi")} {formatNumber(promo.uses)}{promo.maxUses != null ? ` / ${formatNumber(promo.maxUses)}` : ""}</span>
            <CopyButton text={promo.code} />
          </span>
        }
        actions={
          <>
            <form action={togglePromoCode}>
              <input type="hidden" name="code" value={promo.code} />
              <button type="submit" className={secondaryButtonClass}>{promo.active ? "Oʻchirish" : "Yoqish"}</button>
            </form>
            {promo.uses === 0 && redemptions.length === 0 && (
              <form action={deletePromoCode}>
                <input type="hidden" name="code" value={promo.code} />
                <button type="submit" className={dangerButtonClass}>{t("Oʻchirib tashlash")}</button>
              </form>
            )}
            <Link href="/admin/promocodes" className={secondaryButtonClass}>{t("← Promokodlar")}</Link>
          </>
        }
      />
      {inUse && <div className="mb-4"><Notice tone="error">{t("Bu kod buyurtmalarda ishlatilgan — uni oʻchirib boʻlmaydi. Oʻrniga «Oʻchirish» bilan faolsizlantiring.")}</Notice></div>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Card title={t("Sozlamalar")}>
          <PromoCodeForm promo={promo} products={products.map((p) => ({ slug: p.slug, name: p.name }))} />
        </Card>
        <Card title={t("Ishlatilishi")} lead={live.length ? `${formatNumber(live.length)} ta buyurtma · ${som(revenue)} tushum · ${som(given)} chegirma` : undefined}>
          {redemptions.length === 0 ? (
            <EmptyState title={t("Hali ishlatilmagan")} />
          ) : (
            <TableWrap>
              <table className={`${tableClass} min-w-[420px]`}>
                <thead>
                  <tr>
                    <th className={thClass}>{t("Buyurtma")}</th>
                    <th className={`${thClass} text-right`}>{t("Chegirma")}</th>
                    <th className={`${thClass} text-right`}>{t("Jami")}</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr key={`${r.orderNumber}-${r.createdAt.getTime()}`}>
                      <td className={tdClass}>
                        {r.orderNumber ? <Link href={`/admin/orders/${r.orderNumber}`} className={`${linkClass} inline-flex min-h-11 items-center`}>{r.orderNumber}</Link> : "—"}
                        <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                          {formatDateTime(r.createdAt)} <Pill tone={STATUS_TONE[r.status as OrderStatus] ?? "muted"}>{STATUS_LABEL[r.status as OrderStatus] ?? r.status}</Pill>
                        </p>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>−{som(r.discount)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{som(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </div>
    </>
  );
}
