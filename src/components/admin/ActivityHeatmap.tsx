"use client";

import { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const DAY_NAMES = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

/*
  Weekday × hour, one hue: ink mixed into the tile background by share of
  the busiest cell. Answers "when do people come, when do they buy" — the
  hours to post in Telegram or to keep the operator at the phone.
*/
export function ActivityHeatmap({ visits, orders, days }: { visits: number[][]; orders: number[][]; days: number }) {
  const [mode, setMode] = useState<"visits" | "orders">(visits.flat().some(Boolean) ? "visits" : "orders");
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const grid = mode === "visits" ? visits : orders;
  const max = Math.max(1, ...grid.flat());
  const total = grid.flat().reduce((a, b) => a + b, 0);
  let peak = { d: 0, h: 0, v: 0 };
  grid.forEach((row, d) => row.forEach((v, h) => { if (v > peak.v) peak = { d, h, v }; }));
  const unit = mode === "visits" ? "tashrif" : "buyurtma";

  return (
    <section className="min-w-0 rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold leading-6 text-ink">Faol vaqtlar</h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            Oxirgi {days} kun, Toshkent vaqti.{" "}
            {peak.v > 0 ? <>Eng faol: <b className="font-semibold text-ink">{DAY_NAMES[peak.d]}, {String(peak.h).padStart(2, "0")}:00</b></> : "Hali maʼlumot yoʻq."}
          </p>
        </div>
        <div className="flex gap-1 rounded-[14px] bg-tile p-1" role="group" aria-label="Nimani koʻrsatish">
          {(["visits", "orders"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex h-11 items-center rounded-[12px] px-3.5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                mode === m ? "bg-white text-ink shadow-[0_1px_2px_rgba(23,25,27,0.08)]" : "text-ink-2 hover:text-ink",
              )}
            >
              {m === "visits" ? "Tashriflar" : "Buyurtmalar"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-[420px]" onMouseLeave={() => setHover(null)} aria-hidden="true">
          <div className="grid grid-cols-[28px_repeat(24,minmax(12px,1fr))] gap-[2px]">
            {grid.map((row, d) => (
              <div key={d} className="contents">
                <span className="flex items-center text-[12px] text-muted">{DAYS[d]}</span>
                {row.map((v, h) => (
                  <span
                    key={h}
                    onMouseEnter={() => setHover({ d, h })}
                    className={cn("h-6 rounded-[3px]", hover?.d === d && hover.h === h && "ring-2 ring-ink ring-offset-1")}
                    style={{ backgroundColor: v === 0 ? "var(--color-tile)" : `color-mix(in srgb, var(--color-ink) ${Math.round(12 + (v / max) * 88)}%, var(--color-tile))` }}
                  />
                ))}
              </div>
            ))}
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="pt-1 text-center text-[12px] tabular-nums text-muted">{h % 3 === 0 ? h : ""}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-3 text-[13px] text-ink-2">
        <p role="status">
          {hover ? <>{DAY_NAMES[hover.d]}, {String(hover.h).padStart(2, "0")}:00–{String(hover.h + 1).padStart(2, "0")}:00 — <b className="tabular-nums text-ink">{formatNumber(grid[hover.d][hover.h])}</b> {unit}</> : <>Jami <b className="tabular-nums text-ink">{formatNumber(total)}</b> {unit}</>}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted" aria-hidden="true">
          kam
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <span key={f} className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: f === 0 ? "var(--color-tile)" : `color-mix(in srgb, var(--color-ink) ${Math.round(12 + f * 88)}%, var(--color-tile))` }} />
          ))}
          koʻp
        </span>
      </div>

      <div className="sr-only">
      <table>
        <caption>Faol vaqtlar: {unit}lar soni, kun va soat boʻyicha</caption>
        <tbody>
          {grid.map((row, d) => (
            <tr key={d}><th scope="row">{DAY_NAMES[d]}</th>{row.map((v, h) => <td key={h}>{h}:00 — {v}</td>)}</tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
