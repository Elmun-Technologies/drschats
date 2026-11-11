"use client";

import { useActionState, useState } from "react";
import { saveAnnouncements } from "@/app/admin/_actions/storefront";
import type { FormState } from "@/app/admin/_actions/catalog";
import { Field, Notice, inputClass, secondaryButtonClass, smallButtonClass, smallDangerButtonClass } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/admin/i18n/client";

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
  const t = useT();
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
              <h2 className="text-[17px] font-bold text-ink">{i + 1}{t("-eʼlon")}</h2>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`${i + 1}-eʼlonni yuqoriga`} className={cn(smallButtonClass, "w-11 px-0 disabled:opacity-40")}>↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} aria-label={`${i + 1}-eʼlonni pastga`} className={cn(smallButtonClass, "w-11 px-0 disabled:opacity-40")}>↓</button>
                <button type="button" onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))} className={smallDangerButtonClass}>
                  {t("Olib tashlash")}
                </button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={t("Matn (uz)")} hint={t("140 belgigacha")}>
                <input name={`a.${i}.uz`} value={r.uz} maxLength={140} onChange={(e) => update(r.key, { uz: e.target.value })} className={inputClass} placeholder={t("Masalan: 300 000 soʻmdan bepul yetkazish")} />
              </Field>
              <Field label={t("Matn (ru)")} hint={t("140 belgigacha")}>
                <input name={`a.${i}.ru`} value={r.ru} maxLength={140} onChange={(e) => update(r.key, { ru: e.target.value })} className={inputClass} placeholder={t("Например: бесплатная доставка от 300 000 сум")} />
              </Field>
              <Field label={t("Havola (ixtiyoriy)")} hint={t("/delivery, /sale yoki https://…")}>
                <input name={`a.${i}.href`} value={r.href} onChange={(e) => update(r.key, { href: e.target.value })} className={inputClass} />
              </Field>
              <Field label={t("Tugash vaqti (ixtiyoriy)")} hint={t("Toshkent vaqti. Shu vaqtda eʼlon oʻzi yoʻqoladi")}>
                <input name={`a.${i}.endsAt`} type="datetime-local" value={r.endsAt} onChange={(e) => update(r.key, { endsAt: e.target.value, showCountdown: e.target.value ? r.showCountdown : false })} className={inputClass} />
              </Field>
              <label className={cn("flex min-h-12 items-center gap-3 text-[15px] font-semibold", r.endsAt ? "text-ink" : "text-muted")}>
                <input type="checkbox" name={`a.${i}.showCountdown`} checked={r.showCountdown && Boolean(r.endsAt)} disabled={!r.endsAt} onChange={(e) => update(r.key, { showCountdown: e.target.checked })} className="h-5 w-5 accent-ink" />
                {t("Taymer koʻrsatish")}
              </label>
              <label className="flex min-h-12 items-center gap-3 text-[15px] font-semibold text-ink">
                <input type="checkbox" name={`a.${i}.active`} checked={r.active} onChange={(e) => update(r.key, { active: e.target.checked })} className="h-5 w-5 accent-ink" />
                {t("Yoqilgan")}
              </label>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRows((list) => [...list, blank()])} disabled={rows.length >= max} className={cn(secondaryButtonClass, "disabled:opacity-50")}>
          {t("+ Eʼlon qoʻshish")}
        </button>
        <SubmitButton>{t("Saqlash")}</SubmitButton>
      </div>
    </form>
  );
}
