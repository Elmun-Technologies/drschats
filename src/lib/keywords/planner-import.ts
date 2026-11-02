/*
  Reads a Google Keyword Planner export: "Download keyword ideas" or "Get
  search volume and forecasts", as CSV (UTF-16LE, tab-separated, two title
  lines above the header) or as a Google Sheets/CSV file (UTF-8, comma).
  The UI may be English or Russian. Accounts without active campaigns get
  ranges ("1K – 10K") instead of numbers: both ends are kept, and the
  geometric middle is used for sorting and sums (an estimate, shown as such).
*/

export interface PlannerRow {
  keyword: string;
  avg: number | null;
  avgLow: number | null;
  avgHigh: number | null;
  ranged: boolean;
  competition: "low" | "medium" | "high" | null;
  competitionIndex: number | null;
  bidLow: number | null;
  bidHigh: number | null;
  threeMonthChange: string | null;
  yoyChange: string | null;
  /** "2026-01" → searches. */
  monthly: Record<string, number>;
}

export interface PlannerFile {
  rows: PlannerRow[];
  currency: string | null;
  skipped: number;
}

export function decodePlannerFile(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder("utf-8").decode(bytes.subarray(3));
  // UTF-16 without a BOM: every other byte of ASCII text is zero.
  let zeros = 0;
  for (let i = 1; i < Math.min(bytes.length, 400); i += 2) if (bytes[i] === 0) zeros++;
  return new TextDecoder(zeros > 60 ? "utf-16le" : "utf-8").decode(bytes);
}

function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

const HEAD = {
  keyword: /^(keyword|ключевое слово|ключевые слова|kalit so['ʻ]?z)$/i,
  currency: /^(currency|валюта)/i,
  avg: /^(avg\.? monthly searches|среднее число запросов|среднее количество запросов)/i,
  three: /^(three month change|изменение за три месяца|изменение за 3 месяца)/i,
  yoy: /^(yoy change|изменение по сравнению с прошлым годом|изменение за год)/i,
  competitionIndex: /^(competition \(indexed value\)|конкуренция \(индекс)/i,
  competition: /^(competition|конкуренция)$/i,
  bidLow: /^(top of page bid \(low range\)|ставка для показа .*\(нижн)/i,
  bidHigh: /^(top of page bid \(high range\)|ставка для показа .*\(верхн)/i,
  month: /^(searches|запросы|количество запросов)\s*:\s*(.+)$/i,
};

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  янв: 1, фев: 2, мар: 3, апр: 4, май: 5, мая: 5, июн: 6, июл: 7, авг: 8, сен: 9, окт: 10, ноя: 11, дек: 12,
};

function monthKey(label: string): string | null {
  const m = /([a-zа-яё]+)\.?\s+(\d{4})/i.exec(label.trim());
  if (!m) return null;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  return month ? `${m[2]}-${String(month).padStart(2, "0")}` : null;
}

/** "1,234" "1 234" "1.5K" "10K" "1M" → number. */
function count(text: string): number | null {
  const t = text.replace(/\s| /g, "").replace(/,/g, "").toLowerCase();
  const m = /^(\d+(?:\.\d+)?)(k|тыс\.?|m|млн\.?)?$/.exec(t);
  if (!m) return null;
  const mult = m[2]?.startsWith("k") || m[2]?.startsWith("т") ? 1_000 : m[2]?.startsWith("m") ? 1_000_000 : 1;
  return Math.round(Number(m[1]) * mult);
}

function volume(text: string): { avg: number | null; low: number | null; high: number | null; ranged: boolean } {
  const parts = text.split(/\s*[–—-]\s*/).filter(Boolean);
  if (parts.length === 2) {
    const low = count(parts[0]);
    const high = count(parts[1]);
    if (low !== null && high !== null) return { avg: Math.round(Math.sqrt(Math.max(low, 1) * high)), low, high, ranged: true };
  }
  const n = count(text);
  return { avg: n, low: n, high: n, ranged: false };
}

function money(text: string): number | null {
  const t = text.replace(/[^\d.,]/g, "").replace(/,(?=\d{1,2}$)/, ".").replace(/,/g, "");
  return t ? Number(t) : null;
}

function competitionOf(text: string): PlannerRow["competition"] {
  const t = text.toLowerCase();
  if (/^(low|низк)/.test(t)) return "low";
  if (/^(medium|средн)/.test(t)) return "medium";
  if (/^(high|высок)/.test(t)) return "high";
  return null;
}

export function parsePlannerExport(text: string): PlannerFile {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  // The header is the first line whose first cell is exactly "Keyword" (the title line above starts "Keyword Stats").
  const headerAt = lines.findIndex((l) => HEAD.keyword.test((l.split(/[\t,;]/)[0] ?? "").replace(/"/g, "").trim()));
  if (headerAt < 0) throw new Error("Keyword Planner faylida «Keyword» ustuni topilmadi.");
  const headerLine = lines[headerAt];
  const delimiter = headerLine.includes("\t") ? "\t" : headerLine.split(";").length > headerLine.split(",").length ? ";" : ",";
  const header = splitLine(headerLine, delimiter);
  const col = (re: RegExp) => header.findIndex((h) => re.test(h));
  const idx = {
    keyword: col(HEAD.keyword),
    currency: col(HEAD.currency),
    avg: col(HEAD.avg),
    three: col(HEAD.three),
    yoy: col(HEAD.yoy),
    competitionIndex: col(HEAD.competitionIndex),
    competition: col(HEAD.competition),
    bidLow: col(HEAD.bidLow),
    bidHigh: col(HEAD.bidHigh),
  };
  const months = header.flatMap((h, i) => {
    const m = HEAD.month.exec(h);
    const key = m ? monthKey(m[2]) : null;
    return key ? [{ i, key }] : [];
  });

  const rows: PlannerRow[] = [];
  let currency: string | null = null;
  let skipped = 0;
  for (const line of lines.slice(headerAt + 1)) {
    if (!line.trim()) continue;
    const cells = splitLine(line, delimiter);
    const keyword = (cells[idx.keyword] ?? "").trim();
    if (!keyword) {
      skipped++;
      continue;
    }
    const at = (i: number) => (i >= 0 ? (cells[i] ?? "").trim() : "");
    currency ??= at(idx.currency) || null;
    const v = volume(at(idx.avg));
    const monthly: Record<string, number> = {};
    for (const { i, key } of months) {
      const n = count(at(i));
      if (n !== null) monthly[key] = n;
    }
    rows.push({
      keyword,
      avg: v.avg,
      avgLow: v.low,
      avgHigh: v.high,
      ranged: v.ranged,
      competition: competitionOf(at(idx.competition)),
      competitionIndex: at(idx.competitionIndex) ? count(at(idx.competitionIndex)) : null,
      bidLow: at(idx.bidLow) ? money(at(idx.bidLow)) : null,
      bidHigh: at(idx.bidHigh) ? money(at(idx.bidHigh)) : null,
      threeMonthChange: at(idx.three) || null,
      yoyChange: at(idx.yoy) || null,
      monthly,
    });
  }
  return { rows, currency, skipped };
}
