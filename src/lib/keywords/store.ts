import "server-only";

import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { keywordImports, keywordStats } from "@/lib/db/schema";
import { shopflow } from "@/lib/shopflow";
import { getHealthTopicIndex } from "@/lib/content/health-topics";
import { analyseDemand, type ShopProduct, type StatRow } from "./analysis";
import { buildKeywordList, guessSubject, keywordIndex, languageOf, normalizeKeyword, type KeywordRow } from "./generate";
import type { PlannerFile } from "./planner-import";

/** The shop's products in both languages, as the analysis and the keyword list read them. */
async function catalogue() {
  const [uz, ru] = await Promise.all([
    shopflow.getProducts({ locale: "uz", pageSize: 1000 }).catch(() => ({ items: [] })),
    shopflow.getProducts({ locale: "ru", pageSize: 1000 }).catch(() => ({ items: [] })),
  ]);
  const ruBySlug = new Map(ru.items.map((p) => [p.slug, p]));
  return uz.items.map((p) => {
    const r = ruBySlug.get(p.slug);
    return {
      slug: p.slug,
      name: { uz: p.name, ru: r?.name ?? p.name },
      brand: p.brand?.name ?? null,
      inStock: p.inStock,
      text: [p.name, r?.name, p.brand?.name, ...(p.ingredients ?? []).map((i) => i.name), ...(r?.ingredients ?? []).map((i) => i.name)].filter(Boolean).join(" · ").toLowerCase(),
    };
  });
}

export async function currentKeywordList(): Promise<KeywordRow[]> {
  return buildKeywordList(await catalogue());
}

export async function importPlannerFile(file: PlannerFile, fileName: string | null, adminUserId: number): Promise<{ rows: number; matched: number }> {
  const index = keywordIndex(await currentKeywordList());
  const db = getDb();
  let matched = 0;
  const values = file.rows.map((r) => {
    const keyword = normalizeKeyword(r.keyword);
    const known = index.get(keyword);
    const guess = known ? null : guessSubject(keyword);
    if (known || guess) matched++;
    return {
      keyword,
      lang: known?.lang ?? languageOf(keyword),
      subject: known?.subject ?? guess?.subject ?? null,
      kind: known?.kind ?? guess?.kind ?? null,
      intent: known?.intent ?? "idea",
      avgMonthly: r.avg,
      avgLow: r.avgLow,
      avgHigh: r.avgHigh,
      ranged: r.ranged,
      competition: r.competition,
      competitionIndex: r.competitionIndex,
      bidLow: r.bidLow == null ? null : String(r.bidLow),
      bidHigh: r.bidHigh == null ? null : String(r.bidHigh),
      threeMonthChange: r.threeMonthChange,
      yoyChange: r.yoyChange,
      monthly: r.monthly,
    };
  });
  // Planner lists a keyword once, but two spellings can normalise to one row: the larger wins.
  const unique = new Map<string, (typeof values)[number]>();
  for (const v of values) {
    const prev = unique.get(v.keyword);
    if (!prev || (v.avgMonthly ?? 0) > (prev.avgMonthly ?? 0)) unique.set(v.keyword, v);
  }
  await db.transaction(async (tx) => {
    const [imp] = await tx
      .insert(keywordImports)
      .values({ fileName: fileName?.slice(0, 200) ?? null, rows: unique.size, matched, currency: file.currency, ranged: file.rows.some((r) => r.ranged), adminUserId })
      .returning({ id: keywordImports.id });
    const rows = [...unique.values()].map((v) => ({ ...v, importId: imp.id }));
    for (let i = 0; i < rows.length; i += 500) {
      await tx
        .insert(keywordStats)
        .values(rows.slice(i, i + 500))
        .onConflictDoUpdate({
          target: keywordStats.keyword,
          set: {
            lang: sql`excluded.lang`, subject: sql`excluded.subject`, kind: sql`excluded.kind`, intent: sql`excluded.intent`,
            avgMonthly: sql`excluded.avg_monthly`, avgLow: sql`excluded.avg_low`, avgHigh: sql`excluded.avg_high`, ranged: sql`excluded.ranged`,
            competition: sql`excluded.competition`, competitionIndex: sql`excluded.competition_index`, bidLow: sql`excluded.bid_low`, bidHigh: sql`excluded.bid_high`,
            threeMonthChange: sql`excluded.three_month_change`, yoyChange: sql`excluded.yoy_change`, monthly: sql`excluded.monthly`,
            importId: sql`excluded.import_id`, updatedAt: sql`now()`,
          },
        });
    }
  });
  return { rows: unique.size, matched };
}

async function siteSearchTerms(days = 90): Promise<{ term: string; count: number }[]> {
  try {
    const rows = (await getDb().execute(sql`
      select lower(meta->>'term') as term, count(*)::int as n from visitor_events
      where type = 'search' and meta ? 'term' and created_at > now() - make_interval(days => ${days})
      group by 1 order by 2 desc limit 500`)) as unknown as { term: string; n: number }[];
    return rows.map((r) => ({ term: r.term, count: Number(r.n) }));
  } catch {
    return [];
  }
}

export async function keywordDashboard() {
  const db = getDb();
  const [stats, products, terms, imports] = await Promise.all([
    db.select().from(keywordStats),
    catalogue(),
    siteSearchTerms(),
    db.select().from(keywordImports).orderBy(desc(keywordImports.createdAt)).limit(5),
  ]);
  const rows: StatRow[] = stats.map((s) => ({
    keyword: s.keyword,
    lang: s.lang,
    subject: s.subject,
    kind: s.kind,
    intent: s.intent,
    avg: s.avgMonthly,
    ranged: s.ranged,
    competition: s.competition ?? null,
    bidLow: s.bidLow == null ? null : Number(s.bidLow),
    bidHigh: s.bidHigh == null ? null : Number(s.bidHigh),
    monthly: s.monthly ?? {},
  }));
  const topicKinds = Object.fromEntries(getHealthTopicIndex().map((t) => [t.slug, t.kind]));
  const shop: ShopProduct[] = products.map((p) => ({ slug: p.slug, name: p.name.uz, text: p.text, inStock: p.inStock }));
  return {
    subjects: analyseDemand(rows, shop, terms, topicKinds),
    keywords: rows.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)),
    siteTerms: terms.slice(0, 30),
    imports,
    ranged: rows.some((r) => r.ranged),
  };
}
