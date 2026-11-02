import { describe, expect, it } from "vitest";
import { decodePlannerFile, parsePlannerExport } from "./planner-import";

const EN = [
  "Keyword Stats 2026-11-02 at 12_00_00",
  "October 1, 2025 - September 30, 2026",
  ["Keyword", "Currency", "Avg. monthly searches", "Three month change", "YoY change", "Competition", "Competition (indexed value)", "Top of page bid (low range)", "Top of page bid (high range)", "Searches: Oct 2025", "Searches: Nov 2025"].join("\t"),
  ["витамин д3", "UZS", "1,900", "0%", "+22%", "Low", "12", "1,050.00", "3,400.50", "1,600", "2,400"].join("\t"),
  ["magniy narxi", "UZS", "10 – 100", "", "", "Medium", "45", "", "", "50", "70"].join("\t"),
  "",
].join("\r\n");

function utf16(text: string): Uint8Array {
  const buf = Buffer.from(`﻿${text}`, "utf16le");
  return new Uint8Array(buf);
}

describe("Keyword Planner export", () => {
  it("reads the UTF-16 tab file with title lines, exact numbers and ranges", () => {
    const file = parsePlannerExport(decodePlannerFile(utf16(EN)));
    expect(file.currency).toBe("UZS");
    expect(file.rows).toHaveLength(2);
    const [d3, mg] = file.rows;
    expect(d3).toMatchObject({ keyword: "витамин д3", avg: 1900, ranged: false, competition: "low", competitionIndex: 12, bidLow: 1050, bidHigh: 3400.5, yoyChange: "+22%" });
    expect(d3.monthly).toEqual({ "2025-10": 1600, "2025-11": 2400 });
    expect(mg).toMatchObject({ avgLow: 10, avgHigh: 100, ranged: true, competition: "medium" });
    expect(mg.avg).toBe(32);
  });

  it("reads a UTF-8 comma file with a Russian header and K ranges", () => {
    const text = [
      "Ключевое слово,Валюта,Среднее число запросов в месяц,Конкуренция,Конкуренция (индексированное значение)",
      '"омега 3 купить",UZS,1K – 10K,Высокая,80',
    ].join("\n");
    const file = parsePlannerExport(decodePlannerFile(new TextEncoder().encode(text)));
    expect(file.rows[0]).toMatchObject({ keyword: "омега 3 купить", avgLow: 1000, avgHigh: 10000, ranged: true, competition: "high", competitionIndex: 80 });
  });

  it("explains a file that is not a Planner export", () => {
    expect(() => parsePlannerExport("a,b\n1,2")).toThrow(/Keyword/);
  });
});
