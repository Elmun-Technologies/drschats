import Link from "next/link";
import { PROMO_SOURCES, type PromoSource } from "@/lib/db/schema";
import { PROMO_FILTERS, SOURCE_LABEL, listPromoCodes, parsePromoFilter, promoStats, promoValueLabel, type PromoListRow } from "@/lib/admin/promocodes";
import { readFirstOrderSetting } from "@/lib/promo/settings";
import { formatDateTime } from "@/lib/admin/order-labels";
import { generatePromoBatch, saveFirstOrderDiscount } from "@/app/admin/_actions/promocodes";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, ChipNav, EmptyState, Field, Metric, Notice, PageHeader, Pill, SectionTitle, TableWrap, buttonClass, inputClass, linkClass, secondaryButtonClass, som, somShort, tableClass, tdClass, thClass, type PillTone } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Promokodlar" };

type Search = { filter?: string; source?: string; q?: string; batch?: string; made?: string; saved?: string; deleted?: string };

function status(row: PromoListRow, now: number): { label: string; tone: PillTone } {
  if (!row.active) return { label: "Oʻchirilgan", tone: "muted" };
  if (row.endsAt && row.endsAt.getTime() <= now) return { label: "Tugagan", tone: "muted" };
  if (row.maxUses != null && row.uses >= row.maxUses) return { label: "Limit tugagan", tone: "muted" };
  if (row.startsAt && row.startsAt.getTime() > now) return { label: "Rejalashtirilgan", tone: "outline" };
  return { label: "Faol", tone: "dark" };
}

function conditions(row: PromoListRow): string {
  const parts: string[] = [];
  if (row.minSubtotal) parts.push(`${som(row.minSubtotal)} dan`);
  parts.push(row.productCount ? `${row.productCount} ta mahsulot` : "barcha mahsulotlar");
  if (row.phone9) parts.push(`faqat +998 ${row.phone9}`);
  else if (row.perPhoneLimit > 1) parts.push(`1 telefon — ${row.perPhoneLimit} marta`);
  return parts.join(" · ");
}

export default async function AdminPromoCodesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filter = parsePromoFilter(params.filter);
  const source = (PROMO_SOURCES as readonly string[]).includes(params.source ?? "") ? (params.source as PromoSource) : null;
  const q = params.q?.trim() ?? "";
  const batch = params.batch?.trim() || null;
  const [rows, stats, firstOrder] = await Promise.all([listPromoCodes({ filter, source, q, batch }), promoStats(30), readFirstOrderSetting()]);
  const now = Date.now();

  const href = (next: Partial<{ filter: string; source: string | null }>) => {
    const search = new URLSearchParams();
    const f = next.filter ?? filter;
    const s = next.source === undefined ? source : next.source;
    if (f !== "all") search.set("filter", f);
    if (s) search.set("source", s);
    if (q) search.set("q", q);
    const text = search.toString();
    return `/admin/promocodes${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Promokodlar"
        lead="Savatda kiritiladigan kodlar va birinchi buyurtma chegirmasi. Bir buyurtmaga bitta chegirma: promokod yoki birinchi buyurtma — qaysi biri katta boʻlsa. Taklif va obuna narxidagi mahsulotlarga promokod qoʻshilmaydi."
        actions={<Link href="/admin/promocodes/new" className={buttonClass}>+ Yangi promokod</Link>}
      />
      {params.saved && <div className="mb-4"><Notice tone="ok">{params.saved} promokodi yaratildi.</Notice></div>}
      {params.deleted && <div className="mb-4"><Notice tone="ok">Promokod oʻchirildi.</Notice></div>}
      {batch && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[20px] bg-tile p-4">
          <p className="min-w-0 flex-1 text-[15px] text-ink">
            {params.made ? <><b>{formatNumber(Number(params.made) || 0)} ta kod</b> yaratildi · </> : null}
            Toʻplam: <span className="font-semibold">{batch}</span>
          </p>
          <a href={`/admin/promocodes/export?batch=${encodeURIComponent(batch)}`} className={buttonClass}>CSV yuklab olish</a>
          <Link href="/admin/promocodes" className={secondaryButtonClass}>Barcha kodlar</Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Promokodli buyurtmalar" value={formatNumber(stats.orders)} hint="soʻnggi 30 kun" />
        <Metric label="Ular keltirgan tushum" value={somShort(stats.revenue)} hint="bekor qilinganlarsiz" />
        <Metric label="Promokod chegirmasi" value={somShort(stats.promoDiscount)} hint={`${formatNumber(stats.activeCodes)} ta faol kod`} />
        <Metric label="Birinchi buyurtma chegirmasi" value={somShort(stats.firstOrderDiscount)} hint={`${formatNumber(stats.firstOrderOrders)} ta buyurtma`} />
      </div>

      <div className="mb-2 grid gap-4 xl:grid-cols-2">
        <Card title="Birinchi buyurtma chegirmasi" lead="Telefon raqami boʻyicha: avval bekor qilinmagan buyurtmasi boʻlmagan mijozga savatda avtomatik qoʻllanadi. Promokod kattaroq boʻlsa — promokod.">
          <ActionForm action={saveFirstOrderDiscount} submitLabel="Saqlash" className="grid gap-4 sm:grid-cols-2">
            <Field label="Chegirma foizi" hint="1–50">
              <input name="percent" inputMode="numeric" required defaultValue={firstOrder.percent} className={inputClass} />
            </Field>
            <label className="flex min-h-12 items-center gap-3 self-end text-[15px] font-semibold text-ink sm:mb-[22px]">
              <input type="checkbox" name="enabled" defaultChecked={firstOrder.enabled} className="h-5 w-5 accent-ink" />
              Yoqilgan
            </label>
          </ActionForm>
        </Card>
        <Card title="Kodlar toʻplami (SMS / Telegram uchun)" lead="Bir martalik shaxsiy kodlar yaratiladi va CSV boʻlib yuklanadi. Har bir kod bitta buyurtmada ishlaydi.">
          <ActionForm action={generatePromoBatch} submitLabel="Yaratish" className="grid gap-4 sm:grid-cols-2">
            <Field label="Nechta kod"><input name="count" inputMode="numeric" required defaultValue={100} className={inputClass} /></Field>
            <Field label="Nomi" hint="Masalan: oktabr-sms"><input name="label" maxLength={60} className={inputClass} /></Field>
            <Field label="Turi">
              <select name="kind" defaultValue="percent" className={inputClass}>
                <option value="percent">Foiz</option>
                <option value="fixed">Summa (soʻm)</option>
              </select>
            </Field>
            <Field label="Qiymati"><input name="value" inputMode="numeric" required defaultValue={10} className={inputClass} /></Field>
            <Field label="Amal qilish muddati, kun" hint="0 — muddatsiz"><input name="ttlDays" inputMode="numeric" defaultValue={14} className={inputClass} /></Field>
            <Field label="Minimal savat, soʻm" hint="Boʻsh — cheklovsiz"><input name="minSubtotal" inputMode="numeric" className={inputClass} /></Field>
          </ActionForm>
        </Card>
      </div>

      <SectionTitle>Kodlar</SectionTitle>
      <form role="search" action="/admin/promocodes" className="mb-4 flex flex-wrap gap-2">
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        {source && <input type="hidden" name="source" value={source} />}
        <input name="q" defaultValue={q} placeholder="Kod, toʻplam yoki telefon" aria-label="Promokodlarni qidirish" className={`${inputClass} max-w-[440px]`} />
        <button type="submit" className={buttonClass}>Qidirish</button>
        {(q || filter !== "all" || source || batch) && <Link href="/admin/promocodes" className={secondaryButtonClass}>Tozalash</Link>}
      </form>
      <ChipNav
        label="Holat boʻyicha"
        className="mb-2"
        items={(Object.keys(PROMO_FILTERS) as (keyof typeof PROMO_FILTERS)[]).map((f) => ({ href: href({ filter: f }), label: PROMO_FILTERS[f], active: f === filter }))}
      />
      <ChipNav
        label="Manba boʻyicha"
        className="mb-4"
        items={[
          { href: href({ source: null }), label: "Barcha manbalar", active: !source },
          ...PROMO_SOURCES.map((s) => ({ href: href({ source: s }), label: SOURCE_LABEL[s], active: s === source })),
        ]}
      />

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Promokod yoʻq" action={<Link href="/admin/promocodes/new" className={buttonClass}>+ Yangi promokod</Link>}>
            Kod yarating yoki SMS kampaniya uchun toʻplam yarating.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className={`${tableClass} min-w-[980px]`}>
              <thead>
                <tr>
                  <th className={thClass}>Kod</th>
                  <th className={thClass}>Chegirma</th>
                  <th className={thClass}>Shartlar</th>
                  <th className={`${thClass} text-right`}>Ishlatildi</th>
                  <th className={`${thClass} text-right`}>Tushum</th>
                  <th className={thClass}>Muddat</th>
                  <th className={thClass}>Holat</th>
                  <th className={thClass}>Manba</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const s = status(row, now);
                  return (
                    <tr key={row.code}>
                      <td className={tdClass}>
                        <Link href={`/admin/promocodes/${encodeURIComponent(row.code)}`} className={`${linkClass} inline-flex min-h-11 items-center font-mono tracking-wide`}>{row.code}</Link>
                        {row.note && <p className="max-w-[200px] truncate text-[13px] text-muted">{row.note}</p>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap font-semibold`}>{promoValueLabel(row.kind, row.value)}</td>
                      <td className={`${tdClass} text-[13px] text-ink-2`}>{conditions(row)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                        {formatNumber(row.uses)}{row.maxUses != null ? ` / ${formatNumber(row.maxUses)}` : ""}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                        {row.orders ? <>{som(row.revenue)}<p className="text-[13px] text-muted">{formatNumber(row.orders)} ta buyurtma</p></> : "—"}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-[13px] text-ink-2`}>{row.endsAt ? `${formatDateTime(row.endsAt)} gacha` : "muddatsiz"}</td>
                      <td className={tdClass}><Pill tone={s.tone}>{s.label}</Pill></td>
                      <td className={`${tdClass} text-[13px] text-ink-2`}>
                        {SOURCE_LABEL[row.source]}
                        {row.campaignId && <p className="max-w-[180px] truncate text-muted">{row.campaignId}</p>}
                        <p className="text-muted">{formatDateTime(row.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
