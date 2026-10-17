"use client";

import { useActionState, useState } from "react";
import { saveAnnouncements } from "@/app/admin/_actions/storefront";
import type { FormState } from "@/app/admin/_actions/catalog";
import { Field, Notice, inputClass, secondaryButtonClass } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { cn } from "@/lib/utils";

export interface AnnouncementRow {
  key: string;
  id: string;
  uz: string;
  ru: string;
  href: string;
  endsAt: string;
  showCountdown: boolean;
  active: boolean;
}

const blank = (): AnnouncementRow => ({ key: Math.random().toString(36).slice(2), id: "", uz: "", ru: "", href: "", endsAt: "", showCountdown: false, active: true });

/* The announcement lines, edited as one list and saved together. */
export function AnnouncementsForm({ rows: initial, max }: { rows: AnnouncementRow[]; max: number }) {
  const [state, action] = useActionState<FormState, FormData>(saveAnnouncements, undefined);
  const [rows, setRows] = useState(initial.length ? initial : [blank()]);
  const update = (key: string, patch: Partial<AnnouncementRow>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (from: number, to: number) =>
    setRows((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.ok && <Notice tone="ok">{state.ok}</Notice>}
      <ol className="flex flex-col gap-4">
        {rows.map((r, i) => (
          <li key={r.key} className="rounded-[20px] border border-line bg-white p-5 sm:p-6">
            <input type="hidden" name={`a.${i}.id`} value={r.id} />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[17px] font-bold text-ink">{i + 1}-eʼlon</h2>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`${i + 1}-eʼlonni yuqoriga`} className="grid h-11 w-11 place-items-center rounded-[12px] bg-tile text-ink hover:bg-tile-hover disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} aria-label={`${i + 1}-eʼlonni pastga`} className="grid h-11 w-11 place-items-center rounded-[12px] bg-tile text-ink hover:bg-tile-hover disabled:opacity-40">↓</button>
                <button type="button" onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))} className="inline-flex h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-red hover:bg-tile">
                  Olib tashlash
                </button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Matn (uz)" hint="140 belgigacha">
                <input name={`a.${i}.uz`} value={r.uz} maxLength={140} onChange={(e) => update(r.key, { uz: e.target.value })} className={inputClass} placeholder="Masalan: 300 000 soʻmdan bepul yetkazish" />
              </Field>
              <Field label="Matn (ru)" hint="140 belgigacha">
                <input name={`a.${i}.ru`} value={r.ru} maxLength={140} onChange={(e) => update(r.key, { ru: e.target.value })} className={inputClass} placeholder="Например: бесплатная доставка от 300 000 сум" />
              </Field>
              <Field label="Havola (ixtiyoriy)" hint="/delivery, /sale yoki https://…">
                <input name={`a.${i}.href`} value={r.href} onChange={(e) => update(r.key, { href: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Tugash vaqti (ixtiyoriy)" hint="Toshkent vaqti. Shu vaqtda eʼlon oʻzi yoʻqoladi">
                <input name={`a.${i}.endsAt`} type="datetime-local" value={r.endsAt} onChange={(e) => update(r.key, { endsAt: e.target.value, showCountdown: e.target.value ? r.showCountdown : false })} className={inputClass} />
              </Field>
              <label className={cn("flex min-h-12 items-center gap-3 text-[15px] font-semibold", r.endsAt ? "text-ink" : "text-muted")}>
                <input type="checkbox" name={`a.${i}.showCountdown`} checked={r.showCountdown && Boolean(r.endsAt)} disabled={!r.endsAt} onChange={(e) => update(r.key, { showCountdown: e.target.checked })} className="h-5 w-5 accent-ink" />
                Taymer koʻrsatish
              </label>
              <label className="flex min-h-12 items-center gap-3 text-[15px] font-semibold text-ink">
                <input type="checkbox" name={`a.${i}.active`} checked={r.active} onChange={(e) => update(r.key, { active: e.target.checked })} className="h-5 w-5 accent-ink" />
                Yoqilgan
              </label>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRows((list) => [...list, blank()])} disabled={rows.length >= max} className={cn(secondaryButtonClass, "disabled:opacity-50")}>
          + Eʼlon qoʻshish
        </button>
        <SubmitButton>Saqlash</SubmitButton>
      </div>
    </form>
  );
}
