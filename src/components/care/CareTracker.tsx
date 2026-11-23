"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { CareTrackerCopy } from "@/lib/care/content";
import {
  CHILD_MAX_MONTHS,
  CHILD_STAGES,
  PREGNANCY_WEEKS,
  ageInMonths,
  childStageIndex,
  parseIsoDate,
  trimesterOf,
  weekFromDueDate,
} from "@/lib/care/stages";
import { MAX_CHILDREN, readCare, writeCare, type CareChild, type CareStore } from "@/lib/care/storage";

const DEMO_WEEK = 24;
const DEMO_MONTHS = 8;

/*
  The interactive heart of /care/mom and /care/baby. Until the visitor types a
  date it shows a labelled sample; afterwards it shows their own week or age.
  The first render is always the sample, and the stored date is read in an
  effect, so the server HTML and the first client render match.
*/
export function CareTracker({
  mode,
  copy,
  clubHref,
  clubLabel,
}: {
  mode: "pregnancy" | "child";
  copy: CareTrackerCopy;
  clubHref?: string;
  clubLabel?: string;
}) {
  const [store, setStore] = useState<CareStore>({});
  const [view, setView] = useState(mode === "pregnancy" ? DEMO_WEEK : DEMO_MONTHS);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ids = { date: useId(), name: useId(), range: useId() };

  useEffect(() => {
    const s = readCare();
    setStore(s);
    const now = new Date();
    if (mode === "pregnancy" && s.due) {
      const w = weekFromDueDate(parseIsoDate(s.due)!, now);
      if (w) setView(Math.min(w, PREGNANCY_WEEKS));
    }
    if (mode === "child" && s.children?.length) {
      const first = s.children[0];
      setSelected(first.id);
      const m = ageInMonths(parseIsoDate(first.birth)!, now);
      if (m !== null && m < CHILD_MAX_MONTHS) setView(m);
    }
  }, [mode]);

  const save = (next: CareStore) => {
    setStore(next);
    writeCare(next);
  };

  const max = mode === "pregnancy" ? PREGNANCY_WEEKS : CHILD_MAX_MONTHS - 1;
  const min = mode === "pregnancy" ? 1 : 0;
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const own =
    mode === "pregnancy"
      ? Boolean(store.due)
      : Boolean(store.children?.some((c) => c.id === selected));

  const stageIdx = mode === "pregnancy" ? trimesterOf(view) - 1 : (childStageIndex(view) ?? CHILD_STAGES.length - 1);
  const checklist = copy.checklist[stageIdx] ?? [];

  const bigNumber = mode === "pregnancy" ? String(view) : view < 12 ? String(view) : String(Math.floor(view / 12));
  const unitLabel =
    mode === "pregnancy"
      ? copy.unit
      : view < 12
        ? copy.unit
        : `${copy.unitYears ?? ""}${view % 12 ? ` ${view % 12} ${copy.unitMonths ?? ""}` : ""}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const date = String(form.get("date") ?? "");
    const parsed = parseIsoDate(date);
    const now = new Date();
    if (!parsed) return setError(copy.outOfRange);

    if (mode === "pregnancy") {
      const w = weekFromDueDate(parsed, now);
      if (!w) return setError(copy.outOfRange);
      setError(null);
      save({ ...store, due: date });
      setView(Math.min(w, PREGNANCY_WEEKS));
      return;
    }

    const m = ageInMonths(parsed, now);
    if (m === null || m >= CHILD_MAX_MONTHS) return setError(copy.outOfRange);
    const children = store.children ?? [];
    if (children.length >= MAX_CHILDREN) return;
    const name = String(form.get("name") ?? "").trim().slice(0, 40);
    const child: CareChild = { id: `c${Date.now().toString(36)}`, name, birth: date };
    setError(null);
    save({ ...store, children: [...children, child] });
    setSelected(child.id);
    setView(m);
    e.currentTarget.reset();
  }

  function pickChild(c: CareChild) {
    setSelected(c.id);
    const m = ageInMonths(parseIsoDate(c.birth)!, new Date());
    if (m !== null) setView(clamp(m));
  }

  function clearAll() {
    setError(null);
    if (mode === "pregnancy") {
      const { due: _due, ...rest } = store;
      void _due;
      save(rest);
      setView(DEMO_WEEK);
    } else {
      const { children: _c, ...rest } = store;
      void _c;
      save(rest);
      setSelected(null);
      setView(DEMO_MONTHS);
    }
  }

  const children = store.children ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-4">
      <div className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-line p-4 lg:gap-5 lg:rounded-3xl lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[44px] font-extrabold leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[56px]">{bigNumber}</span>
            <span className="text-[15px] text-ink-2 lg:text-[17px]">
              {unitLabel} · {copy.stageNames[stageIdx]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!own && <span className="rounded-full bg-chip-strong px-2.5 py-1 text-xs font-semibold">{copy.demo}</span>}
            <button
              type="button"
              onClick={() => setView((v) => clamp(v - 1))}
              aria-label={copy.prev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-chip-strong transition-colors hover:bg-tile-hover"
            >
              <Chevron className="-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={() => setView((v) => clamp(v + 1))}
              aria-label={copy.next}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-chip-strong transition-colors hover:bg-tile-hover"
            >
              <Chevron />
            </button>
          </div>
        </div>

        <label htmlFor={ids.range} className="sr-only">
          {copy.title}
        </label>
        <input
          id={ids.range}
          type="range"
          min={min}
          max={max}
          step={1}
          value={view}
          onChange={(e) => setView(clamp(Number(e.target.value)))}
          className="h-7 w-full accent-ink"
        />

        {mode === "pregnancy" ? (
          <>
            <div aria-hidden className="grid grid-cols-[repeat(40,minmax(0,1fr))] gap-[2px] lg:gap-[3px]">
              {Array.from({ length: PREGNANCY_WEEKS }, (_, i) => (
                <span key={i} className={cn("h-2 rounded-[3px] lg:h-2.5", i < view ? "bg-ink" : "bg-chip-strong")} />
              ))}
            </div>
            <div aria-hidden className="grid grid-cols-[13fr_14fr_13fr] text-xs text-muted">
              {copy.stageNames.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:grid lg:grid-cols-7">
            {copy.stageNames.map((n, i) => (
              <button
                key={n}
                type="button"
                onClick={() => setView(CHILD_STAGES[i].from)}
                aria-pressed={i === stageIdx}
                className={cn(
                  "min-h-11 shrink-0 rounded-sm px-3 text-[13px] font-semibold transition-colors",
                  i === stageIdx ? "bg-ink text-white" : "bg-tile text-ink-2 hover:bg-tile-hover",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        <ul className="grid gap-2.5 md:grid-cols-3 lg:gap-3">
          {checklist.map(([tag, text]) => (
            <li key={text} className="flex flex-col gap-1.5 rounded-2xl bg-tile p-4">
              <span className="text-xs font-bold text-muted">{tag}</span>
              <span className="text-[15px] leading-[22px]">{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] leading-[18px] text-muted">{copy.note}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-[20px] bg-tile p-4 lg:rounded-3xl lg:p-6">
        {mode === "child" && children.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[15px] font-bold">{copy.childrenTitle}</span>
            {children.map((c) => {
              const m = ageInMonths(parseIsoDate(c.birth)!, new Date());
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickChild(c)}
                  aria-pressed={c.id === selected}
                  className={cn(
                    "flex min-h-[56px] items-center gap-3 rounded-2xl bg-bg px-3 text-left transition-colors",
                    c.id === selected ? "ring-2 ring-ink" : "hover:bg-tile-hover",
                  )}
                >
                  <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-banner font-extrabold">
                    {(c.name || copy.childDefault || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold">{c.name || copy.childDefault}</span>
                    {m !== null && <span className="text-[13px] text-muted">{ageLabel(m, copy)}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {(mode === "child" ? children.length < MAX_CHILDREN : !store.due) && (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {mode === "child" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={ids.name} className="text-sm font-semibold">
                  {copy.nameLabel}
                </label>
                <input
                  id={ids.name}
                  name="name"
                  type="text"
                  maxLength={40}
                  autoComplete="off"
                  className="h-12 rounded-sm border border-line-strong bg-bg px-4 text-base outline-none focus-visible:border-ink"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.date} className="text-sm font-semibold">
                {copy.dateLabel}
              </label>
              <input
                id={ids.date}
                name="date"
                type="date"
                required
                aria-describedby={`${ids.date}-hint`}
                className="h-12 rounded-sm border border-line-strong bg-bg px-4 text-base outline-none focus-visible:border-ink"
              />
              <span id={`${ids.date}-hint`} className="text-[13px] text-muted">
                {copy.dateHint}
              </span>
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-ink">
                {error}
              </p>
            )}
            <button type="submit" className="h-12 rounded-sm bg-ink px-5 text-base font-semibold text-white transition-opacity hover:opacity-90">
              {mode === "child" ? copy.addChild : copy.save}
            </button>
          </form>
        )}

        <p className="text-[13px] leading-[18px] text-ink-2">{copy.stored}</p>

        {own && (
          <button
            type="button"
            onClick={clearAll}
            className="min-h-11 self-start text-[15px] font-semibold underline underline-offset-2 hover:no-underline"
          >
            {copy.clear}
          </button>
        )}

        {clubHref && clubLabel && (
          <a
            href={clubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex h-12 items-center justify-center rounded-sm bg-ink px-5 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            {clubLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function ageLabel(m: number, copy: CareTrackerCopy): string {
  if (m < 12) return `${m} ${copy.unit}`;
  const y = Math.floor(m / 12);
  const rest = m % 12;
  return `${y} ${copy.unitYears ?? ""}${rest ? ` ${rest} ${copy.unitMonths ?? ""}` : ""}`;
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-[18px] w-[18px]", className)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
