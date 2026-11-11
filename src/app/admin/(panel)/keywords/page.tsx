import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { keywordDashboard, currentKeywordList } from "@/lib/keywords/store";
import { SUBJECT_KIND_LABEL, type SubjectKind } from "@/lib/keywords/subjects";
import { formatDateTime } from "@/lib/admin/order-labels";
import { Sparkline } from "@/components/admin/charts";
import { BarList, Card, ChipNav, EmptyState, Metric, Notice, PageHeader, Pill, SectionTitle, TableWrap, buttonClass, linkClass, secondaryButtonClass, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { adminTitle, labels, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Talab tahlili");
export const dynamic = "force-dynamic";

const MONTH = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
const monthName = (ym: string | null) => (ym ? `${t(MONTH[Number(ym.slice(5, 7)) - 1])} ${ym.slice(0, 4)}` : "—");
const COMPETITION = labels({ low: "Past", medium: "Oʻrta", high: "Yuqori" });
const ERRORS: Record<string, string> = labels({
  empty: "Fayl tanlanmagan.",
  size: "Fayl 20 MB dan katta.",
  rows: "Faylda kalit soʻz topilmadi.",
  format: "Bu Keyword Planner eksporti emas yoki fayl buzilgan. Plannerʼdan «Download → CSV» bilan qayta yuklab oling.",
  origin: "Soʻrov boshqa saytdan keldi — rad etildi.",
});
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
        title={t("Talab tahlili")}
        lead={t("Oʻzbekistonda vitamin va BADlar qanday qidirilmoqda: Google Keyword Planner raqamlari bizning assortiment, sayt sahifalari va saytdagi qidiruv bilan yonma-yon.")}
      />
      {params.error && <div className="mb-4"><Notice tone="error">{ERRORS[params.error] ?? t("Yuklab boʻlmadi.")}</Notice></div>}
      {params.imported && <div className="mb-4"><Notice tone="ok">{t("{n} ta kalit soʻz yuklandi, {m} tasi mavzuga bogʻlandi.", { n: formatNumber(Number(params.imported)), m: formatNumber(Number(params.matched ?? 0)) })}</Notice></div>}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t("1. Kalit soʻzlar roʻyxati")} lead={t("Katalog, ingredientlar, sogʻliq mavzulari va bozordagi mashhur vitamin va brendlardan yigʻiladi — mahsulot qoʻshilsa, roʻyxat oʻzi yangilanadi.")}>
          <p className="text-[14px] leading-6 text-ink-2">
            {t("Jami {n} ta: rus — {ru}, oʻzbek lotin — {uz}, oʻzbek kirill — {cyr}.", { n: formatNumber(list.length), ru: formatNumber(langs.ru ?? 0), uz: formatNumber(langs.uz ?? 0), cyr: formatNumber(langs["uz-cyrl"] ?? 0) })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/admin/keywords/export?format=planner" download className={buttonClass}>{t("Keyword Planner uchun CSV")}</a>
            <a href="/admin/keywords/export" download className={secondaryButtonClass}>{t("Guruhlari bilan jadval")}</a>
          </div>
          <ol className="mt-4 list-decimal pl-5 text-[14px] leading-6 text-ink-2">
            <li><a href="https://ads.google.com/aw/keywordplanner/home" target="_blank" rel="noopener noreferrer" className={linkClass}>{t("Google Ads → Keyword Planner ↗")}</a> {t("→ «Get search volume and forecasts».")}</li>
            <li>{t("«Upload file» → yuqoridagi CSV.")}</li>
            <li>Location: <b>Uzbekistan</b>, Language: <b>All languages</b>, Network: <b>Google</b>{t(", davr: oxirgi 12 oy.")}</li>
            <li>{t("«Historical metrics» → «Download keyword ideas»/«Download» →")} <b>CSV</b>{t(". Faylni oʻzgartirmasdan pastga yuklang.")}</li>
          </ol>
        </Card>

        <Card title={t("2. Planner natijasini yuklash")} lead={t("CSV (UTF-16) yoki Google Sheets CSV, ingliz yoki rus interfeysidan. Har yuklash raqamlarni yangilaydi; Planner taklif qilgan yangi soʻzlar ham saqlanadi.")}>
          <form action="/admin/keywords/import" method="post" encType="multipart/form-data" className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              {t("Fayl")}
              <input type="file" name="file" accept=".csv,.tsv,.txt,text/csv" required className="min-h-11 rounded-[12px] border border-line px-3 py-2 text-[14px] font-normal" />
            </label>
            <button type="submit" className={`${buttonClass} self-start`}>{t("Yuklash va tahlil qilish")}</button>
          </form>
          {data.imports.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-[13px] text-muted">
              {data.imports.map((i) => (
                <li key={i.id}>{formatDateTime(i.createdAt)} · {i.fileName ?? t("fayl")} · {t("{n} ta ({m} bogʻlandi)", { n: formatNumber(i.rows), m: formatNumber(i.matched) })}{i.ranged ? ` · ${t("diapazonlar")}` : ""}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!hasData ? (
        <div className="mt-6">
          <Card>
            <EmptyState title={t("Hali Planner maʼlumoti yoʻq")}>{t("Roʻyxatni Keyword Plannerʼda tekshirib, natijani shu yerga yuklang — har vitamin boʻyicha oylik qidiruv, mavsum va bizda bor-yoʻqligi koʻrinadi.")}</EmptyState>
          </Card>
        </div>
      ) : (
        <>
          {data.ranged && <div className="mt-6"><Notice>{t("Planner hisobingiz aniq raqam emas, diapazon berdi («1K – 10K»). Yigʻindilar diapazon oʻrtasidan hisoblangan — taqqoslash uchun yaroqli, aniq son emas. Faol reklama kampaniyasi bor hisobda aniq raqamlar chiqadi.")}</Notice></div>}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label={t("Oylik qidiruv (jami)")} value={`${est}${formatNumber(total)}`} hint={t("barcha mavzular, 3 yozuvda")} />
            <Metric label={t("Maʼlumotli kalit soʻzlar")} value={formatNumber(data.keywords.filter((k) => (k.avg ?? 0) > 0).length)} hint={t("{n} tadan", { n: formatNumber(data.keywords.length) })} />
            <Metric label={t("Eng koʻp qidirilgan vitamin / BAD")} value={topProduct?.label ?? "—"} hint={topProduct ? t("{n} / oy", { n: `${est}${formatNumber(topProduct.total)}` }) : undefined} />
            <Metric label={t("Assortiment imkoniyati")} value={formatNumber(withData.filter((s) => s.gap === "assortment").length)} hint={t("talab bor, bizda yoʻq")} />
          </div>

          {gaps.length > 0 && (
            <div className="mt-4">
              <Card title={t("Talab bor, bizda yoʻq")} lead={t("Oyiga 100+ qidiruv boʻlgan, lekin sotuvda mos mahsulotimiz yoʻq mavzular — assortimentga qoʻshish uchun nomzodlar.")}>
                <BarList rows={gaps.map((g) => ({ label: g.label, value: g.total, note: g.productsOut ? t("{n} ta mahsulot tugagan", { n: g.productsOut }) : t("mahsulot yoʻq") }))} />
              </Card>
            </div>
          )}

          <SectionTitle>{t("Mavzular boʻyicha talab")}</SectionTitle>
          <ChipNav
            label={t("Turi")}
            items={KINDS.map((k) => ({ href: k === "all" ? "/admin/keywords" : `/admin/keywords?kind=${k}`, label: k === "all" ? t("Hammasi") : t(SUBJECT_KIND_LABEL[k]), active: kind === k }))}
            className="mb-4"
          />
          <Card>
            <TableWrap>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>{t("Mavzu")}</th>
                    <th className={`${thClass} text-right`}>{t("Oyiga")}</th>
                    <th className={thClass}>{t("Tillar")}</th>
                    <th className={thClass}>{t("Mavsum")}</th>
                    <th className={thClass}>{t("Bizda")}</th>
                    <th className={thClass}>{t("Sahifa")}</th>
                    <th className={`${thClass} text-right`}>{t("Saytda qidirildi")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className={tdClass}>
                        <span className="block font-semibold text-ink">{s.label}</span>
                        <span className="block text-[13px] text-muted">{s.top.slice(0, 3).map((kw) => kw.keyword).join(" · ") || t("maʼlumot yoʻq")}</span>
                        {s.gap && <Pill tone="outline" className="mt-1">{s.gap === "assortment" ? t("Assortiment imkoniyati") : t("Sahifa kerak")}</Pill>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                        <b className="text-ink">{s.total ? `${est}${formatNumber(s.total)}` : "—"}</b>
                        {s.total > 0 && <span className="block text-[13px] text-muted">{t("xarid {p}%", { p: Math.round((s.buy / s.total) * 100) })}{s.competition ? ` · ${t("raqobat {c}", { c: COMPETITION[s.competition].toLowerCase() })}` : ""}</span>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-[13px] tabular-nums text-ink-2`}>
                        <span className="block">{t("rus {n}", { n: formatNumber(s.byLang.ru) })}</span>
                        <span className="block">{t("oʻzb {n}", { n: formatNumber(s.byLang.uz) })}</span>
                        <span className="block">{t("kirill {n}", { n: formatNumber(s.byLang["uz-cyrl"]) })}</span>
                      </td>
                      <td className={tdClass}>
                        <Sparkline values={s.series.map((p) => p.searches)} className="w-28" />
                        <span className="text-[13px] text-muted">{t("choʻqqi: {m}", { m: monthName(s.peak) })}</span>
                      </td>
                      <td className={`${tdClass} text-[13px]`}>
                        {s.products.length > 0
                          ? s.products.map((p) => <Link key={p.slug} href={`/admin/products?q=${encodeURIComponent(p.slug)}`} className={`${linkClass} block`}>{p.name}</Link>)
                          : <span className="text-muted">{s.productsOut ? t("{n} ta tugagan", { n: s.productsOut }) : s.kind === "brand" || s.kind === "goal" || s.kind === "audience" || s.kind === "symptom" || s.kind === "category" ? "—" : t("yoʻq")}</span>}
                      </td>
                      <td className={`${tdClass} text-[13px]`}>{s.page ? <a href={`/uz${s.page}`} target="_blank" rel="noopener noreferrer" className={linkClass}>{s.page}</a> : <span className="text-muted">{t("yoʻq")}</span>}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{s.siteSearches ? formatNumber(s.siteSearches) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title={t("Eng koʻp qidirilgan kalit soʻzlar")} lead={t("Oyiga oʻrtacha, oxirgi 12 oy. «Narx» — Plannerʼdagi yuqori pozitsiya uchun taklif diapazoni.")}>
              <TableWrap>
                <table className={tableClass}>
                  <thead><tr><th className={thClass}>{t("Kalit soʻz")}</th><th className={`${thClass} text-right`}>{t("Oyiga")}</th><th className={thClass}>{t("Raqobat")}</th><th className={thClass}>{t("Narx (klik)")}</th></tr></thead>
                  <tbody>
                    {data.keywords.slice(0, 60).map((k) => (
                      <tr key={k.keyword}>
                        <td className={tdClass}>{k.keyword}<span className="ml-2 text-[12px] text-muted">{k.lang === "ru" ? t("rus") : k.lang === "uz" ? t("oʻzb") : t("kirill")}</span></td>
                        <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{k.avg ? `${k.ranged ? "≈" : ""}${formatNumber(k.avg)}` : "—"}</td>
                        <td className={`${tdClass} text-[13px]`}>{k.competition ? COMPETITION[k.competition] : "—"}</td>
                        <td className={`${tdClass} whitespace-nowrap text-[13px] tabular-nums`}>{k.bidLow || k.bidHigh ? `${formatNumber(Math.round(k.bidLow ?? 0))} – ${formatNumber(Math.round(k.bidHigh ?? 0))}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Card>
            <Card title={t("Saytdagi qidiruv")} lead={t("Mijozlar saytimizning oʻzida nima qidirgan — oxirgi 90 kun.")}>
              <BarList rows={data.siteTerms.map((st) => ({ label: st.term, value: st.count }))} empty={t("Hali qidiruv yoʻq")} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
