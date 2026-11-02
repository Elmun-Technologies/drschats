import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { keywordDashboard, currentKeywordList } from "@/lib/keywords/store";
import { SUBJECT_KIND_LABEL, type SubjectKind } from "@/lib/keywords/subjects";
import { formatDateTime } from "@/lib/admin/order-labels";
import { Sparkline } from "@/components/admin/charts";
import { BarList, Card, ChipNav, EmptyState, Metric, Notice, PageHeader, Pill, SectionTitle, TableWrap, buttonClass, linkClass, secondaryButtonClass, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Talab tahlili" };
export const dynamic = "force-dynamic";

const MONTH = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
const monthName = (ym: string | null) => (ym ? `${MONTH[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}` : "—");
const COMPETITION = { low: "Past", medium: "Oʻrta", high: "Yuqori" } as const;
const ERRORS: Record<string, string> = {
  empty: "Fayl tanlanmagan.",
  size: "Fayl 20 MB dan katta.",
  rows: "Faylda kalit soʻz topilmadi.",
  format: "Bu Keyword Planner eksporti emas yoki fayl buzilgan. Plannerʼdan «Download → CSV» bilan qayta yuklab oling.",
  origin: "Soʻrov boshqa saytdan keldi — rad etildi.",
};
const KINDS: (SubjectKind | "all")[] = ["all", "vitamin", "mineral", "supplement", "goal", "audience", "symptom", "form", "category", "brand"];

export default async function AdminKeywordsPage({ searchParams }: { searchParams: Promise<{ kind?: string; imported?: string; matched?: string; error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [data, list] = await Promise.all([keywordDashboard(), currentKeywordList()]);
  const kind = KINDS.includes(params.kind as SubjectKind) ? (params.kind as SubjectKind | "all") : "all";
  const subjects = data.subjects.filter((s) => (kind === "all" ? true : s.kind === kind));
  const withData = data.subjects.filter((s) => s.total > 0);
  const topProduct = withData.find((s) => s.kind === "vitamin" || s.kind === "mineral" || s.kind === "supplement");
  const total = withData.reduce((a, s) => a + s.total, 0);
  const langs = list.reduce((acc, r) => ({ ...acc, [r.lang]: (acc[r.lang] ?? 0) + 1 }), {} as Record<string, number>);
  const gaps = withData.filter((s) => s.gap === "assortment").slice(0, 6);
  const hasData = data.keywords.length > 0;
  const est = data.ranged ? "≈" : "";

  return (
    <>
      <PageHeader
        title="Talab tahlili"
        lead="Oʻzbekistonda vitamin va BADlar qanday qidirilmoqda: Google Keyword Planner raqamlari bizning assortiment, sayt sahifalari va saytdagi qidiruv bilan yonma-yon."
      />
      {params.error && <div className="mb-4"><Notice tone="error">{ERRORS[params.error] ?? "Yuklab boʻlmadi."}</Notice></div>}
      {params.imported && <div className="mb-4"><Notice tone="ok">{formatNumber(Number(params.imported))} ta kalit soʻz yuklandi, {formatNumber(Number(params.matched ?? 0))} tasi mavzuga bogʻlandi.</Notice></div>}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="1. Kalit soʻzlar roʻyxati" lead="Katalog, ingredientlar, sogʻliq mavzulari va bozordagi mashhur vitamin va brendlardan yigʻiladi — mahsulot qoʻshilsa, roʻyxat oʻzi yangilanadi.">
          <p className="text-[14px] leading-6 text-ink-2">
            Jami <b className="text-ink">{formatNumber(list.length)}</b> ta: rus — {formatNumber(langs.ru ?? 0)}, oʻzbek lotin — {formatNumber(langs.uz ?? 0)}, oʻzbek kirill — {formatNumber(langs["uz-cyrl"] ?? 0)}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/admin/keywords/export?format=planner" download className={buttonClass}>Keyword Planner uchun CSV</a>
            <a href="/admin/keywords/export" download className={secondaryButtonClass}>Guruhlari bilan jadval</a>
          </div>
          <ol className="mt-4 list-decimal pl-5 text-[14px] leading-6 text-ink-2">
            <li><a href="https://ads.google.com/aw/keywordplanner/home" target="_blank" rel="noopener noreferrer" className={linkClass}>Google Ads → Keyword Planner ↗</a> → «Get search volume and forecasts».</li>
            <li>«Upload file» → yuqoridagi CSV.</li>
            <li>Location: <b>Uzbekistan</b>, Language: <b>All languages</b>, Network: <b>Google</b>, davr: oxirgi 12 oy.</li>
            <li>«Historical metrics» → «Download keyword ideas»/«Download» → <b>CSV</b>. Faylni oʻzgartirmasdan pastga yuklang.</li>
          </ol>
        </Card>

        <Card title="2. Planner natijasini yuklash" lead="CSV (UTF-16) yoki Google Sheets CSV, ingliz yoki rus interfeysidan. Har yuklash raqamlarni yangilaydi; Planner taklif qilgan yangi soʻzlar ham saqlanadi.">
          <form action="/admin/keywords/import" method="post" encType="multipart/form-data" className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Fayl
              <input type="file" name="file" accept=".csv,.tsv,.txt,text/csv" required className="min-h-11 rounded-[12px] border border-line px-3 py-2 text-[14px] font-normal" />
            </label>
            <button type="submit" className={`${buttonClass} self-start`}>Yuklash va tahlil qilish</button>
          </form>
          {data.imports.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-[13px] text-muted">
              {data.imports.map((i) => (
                <li key={i.id}>{formatDateTime(i.createdAt)} · {i.fileName ?? "fayl"} · {formatNumber(i.rows)} ta ({formatNumber(i.matched)} bogʻlandi){i.ranged ? " · diapazonlar" : ""}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!hasData ? (
        <div className="mt-6">
          <Card>
            <EmptyState title="Hali Planner maʼlumoti yoʻq">Roʻyxatni Keyword Plannerʼda tekshirib, natijani shu yerga yuklang — har vitamin boʻyicha oylik qidiruv, mavsum va bizda bor-yoʻqligi koʻrinadi.</EmptyState>
          </Card>
        </div>
      ) : (
        <>
          {data.ranged && <div className="mt-6"><Notice>Planner hisobingiz aniq raqam emas, diapazon berdi («1K – 10K»). Yigʻindilar diapazon oʻrtasidan hisoblangan — taqqoslash uchun yaroqli, aniq son emas. Faol reklama kampaniyasi bor hisobda aniq raqamlar chiqadi.</Notice></div>}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Oylik qidiruv (jami)" value={`${est}${formatNumber(total)}`} hint="barcha mavzular, 3 yozuvda" />
            <Metric label="Maʼlumotli kalit soʻzlar" value={formatNumber(data.keywords.filter((k) => (k.avg ?? 0) > 0).length)} hint={`${formatNumber(data.keywords.length)} tadan`} />
            <Metric label="Eng koʻp qidirilgan vitamin / BAD" value={topProduct?.label ?? "—"} hint={topProduct ? `${est}${formatNumber(topProduct.total)} / oy` : undefined} />
            <Metric label="Assortiment imkoniyati" value={formatNumber(withData.filter((s) => s.gap === "assortment").length)} hint="talab bor, bizda yoʻq" />
          </div>

          {gaps.length > 0 && (
            <div className="mt-4">
              <Card title="Talab bor, bizda yoʻq" lead="Oyiga 100+ qidiruv boʻlgan, lekin sotuvda mos mahsulotimiz yoʻq mavzular — assortimentga qoʻshish uchun nomzodlar.">
                <BarList rows={gaps.map((g) => ({ label: g.label, value: g.total, note: g.productsOut ? `${g.productsOut} ta mahsulot tugagan` : "mahsulot yoʻq" }))} />
              </Card>
            </div>
          )}

          <SectionTitle>Mavzular boʻyicha talab</SectionTitle>
          <ChipNav
            label="Turi"
            items={KINDS.map((k) => ({ href: k === "all" ? "/admin/keywords" : `/admin/keywords?kind=${k}`, label: k === "all" ? "Hammasi" : SUBJECT_KIND_LABEL[k], active: kind === k }))}
            className="mb-4"
          />
          <Card>
            <TableWrap>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Mavzu</th>
                    <th className={`${thClass} text-right`}>Oyiga</th>
                    <th className={thClass}>Tillar</th>
                    <th className={thClass}>Mavsum</th>
                    <th className={thClass}>Bizda</th>
                    <th className={thClass}>Sahifa</th>
                    <th className={`${thClass} text-right`}>Saytda qidirildi</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className={tdClass}>
                        <span className="block font-semibold text-ink">{s.label}</span>
                        <span className="block text-[13px] text-muted">{s.top.slice(0, 3).map((t) => t.keyword).join(" · ") || "maʼlumot yoʻq"}</span>
                        {s.gap && <Pill tone="outline" className="mt-1">{s.gap === "assortment" ? "Assortiment imkoniyati" : "Sahifa kerak"}</Pill>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                        <b className="text-ink">{s.total ? `${est}${formatNumber(s.total)}` : "—"}</b>
                        {s.total > 0 && <span className="block text-[13px] text-muted">xarid {Math.round((s.buy / s.total) * 100)}%{s.competition ? ` · raqobat ${COMPETITION[s.competition].toLowerCase()}` : ""}</span>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-[13px] tabular-nums text-ink-2`}>
                        <span className="block">rus {formatNumber(s.byLang.ru)}</span>
                        <span className="block">oʻzb {formatNumber(s.byLang.uz)}</span>
                        <span className="block">kirill {formatNumber(s.byLang["uz-cyrl"])}</span>
                      </td>
                      <td className={tdClass}>
                        <Sparkline values={s.series.map((p) => p.searches)} className="w-28" />
                        <span className="text-[13px] text-muted">choʻqqi: {monthName(s.peak)}</span>
                      </td>
                      <td className={`${tdClass} text-[13px]`}>
                        {s.products.length > 0
                          ? s.products.map((p) => <Link key={p.slug} href={`/admin/products?q=${encodeURIComponent(p.slug)}`} className={`${linkClass} block`}>{p.name}</Link>)
                          : <span className="text-muted">{s.productsOut ? `${s.productsOut} ta tugagan` : s.kind === "brand" || s.kind === "goal" || s.kind === "audience" || s.kind === "symptom" || s.kind === "category" ? "—" : "yoʻq"}</span>}
                      </td>
                      <td className={`${tdClass} text-[13px]`}>{s.page ? <a href={`/uz${s.page}`} target="_blank" rel="noopener noreferrer" className={linkClass}>{s.page}</a> : <span className="text-muted">yoʻq</span>}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{s.siteSearches ? formatNumber(s.siteSearches) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="Eng koʻp qidirilgan kalit soʻzlar" lead="Oyiga oʻrtacha, oxirgi 12 oy. «Narx» — Plannerʼdagi yuqori pozitsiya uchun taklif diapazoni.">
              <TableWrap>
                <table className={tableClass}>
                  <thead><tr><th className={thClass}>Kalit soʻz</th><th className={`${thClass} text-right`}>Oyiga</th><th className={thClass}>Raqobat</th><th className={thClass}>Narx (klik)</th></tr></thead>
                  <tbody>
                    {data.keywords.slice(0, 60).map((k) => (
                      <tr key={k.keyword}>
                        <td className={tdClass}>{k.keyword}<span className="ml-2 text-[12px] text-muted">{k.lang === "ru" ? "rus" : k.lang === "uz" ? "oʻzb" : "kirill"}</span></td>
                        <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{k.avg ? `${k.ranged ? "≈" : ""}${formatNumber(k.avg)}` : "—"}</td>
                        <td className={`${tdClass} text-[13px]`}>{k.competition ? COMPETITION[k.competition] : "—"}</td>
                        <td className={`${tdClass} whitespace-nowrap text-[13px] tabular-nums`}>{k.bidLow || k.bidHigh ? `${formatNumber(Math.round(k.bidLow ?? 0))} – ${formatNumber(Math.round(k.bidHigh ?? 0))}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Card>
            <Card title="Saytdagi qidiruv" lead="Mijozlar saytimizning oʻzida nima qidirgan — oxirgi 90 kun.">
              <BarList rows={data.siteTerms.map((t) => ({ label: t.term, value: t.count }))} empty="Hali qidiruv yoʻq" />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
