import { requireAdmin } from "@/lib/admin/session";
import { toCsv } from "@/lib/admin/csv";
import { currentKeywordList } from "@/lib/keywords/store";
import { SUBJECTS } from "@/lib/keywords/subjects";
import { toPlannerCsv } from "@/lib/keywords/generate";

export const dynamic = "force-dynamic";

const LANG = { ru: "Rus", uz: "Oʻzbek (lotin)", "uz-cyrl": "Oʻzbek (kirill)" } as const;
const INTENT = { base: "Asosiy", buy: "Xarid", info: "Maʼlumot", brand: "Brend", product: "Mahsulot" } as const;

/*
  ?format=planner — one column, the file Keyword Planner's "Upload file" takes.
  Otherwise the same list with its group, language and intent, for a spreadsheet.
*/
export async function GET(request: Request) {
  await requireAdmin("analytics");
  const rows = await currentKeywordList();
  const date = new Date().toISOString().slice(0, 10);
  if (new URL(request.url).searchParams.get("format") === "planner") {
    return new Response(toPlannerCsv(rows), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="govita-keywords-planner-${date}.csv"`, "Cache-Control": "no-store" },
    });
  }
  const label = new Map(SUBJECTS.map((s) => [s.id, s.label]));
  const csv = toCsv([
    ["Kalit soʻz", "Til", "Niyat", "Guruh", "Turi"],
    ...rows.map((r) => [r.keyword, LANG[r.lang], INTENT[r.intent], label.get(r.subject) ?? (r.subject === "products" ? "Bizning mahsulotlar" : r.subject.replace(/^brand-/, "")), r.kind]),
  ]);
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="govita-keywords-${date}.csv"`, "Cache-Control": "no-store" },
  });
}
