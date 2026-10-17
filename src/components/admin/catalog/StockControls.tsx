"use client";

import { useActionState, useId, useState } from "react";
import { adjustStockAction, saveLowStockDefaultAction } from "@/app/admin/_actions/stock";
import type { FormState } from "@/app/admin/_actions/catalog";
import { Field, Notice, buttonClass, inputClass, secondaryButtonClass, smallButtonClass } from "@/components/admin/ui";
import { stockLabel } from "@/lib/catalog/stock-rules";
import { cn } from "@/lib/utils";
import { AdminDialog } from "./AdminDialog";

type Mode = "delta" | "set" | "untrack";

/*
  The products list's stock cell: the pill is the button. The dialog adds or
  takes units (a delivery, a write-off), sets an exact count (a stocktake) or
  stops tracking; every change is a stock_movements row with the note.
*/
export function StockButton({ id, name, qty, lowAt }: { id: string; name: string; qty: number | null; lowAt: number }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(qty == null ? "set" : "delta");
  const [state, action, pending] = useActionState<FormState, FormData>(adjustStockAction, undefined);
  const formId = useId();
  const label = stockLabel(qty, lowAt);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Ombordagi sonini oʻzgartirish"
        aria-label={`${name}: ombor — ${label.label}. Oʻzgartirish`}
        className={cn(
          "inline-flex h-11 min-w-[112px] items-center justify-center gap-1.5 rounded-[12px] px-3 text-[14px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
          label.tone === "dark" && "bg-ink text-white hover:bg-black",
          label.tone === "outline" && "border border-line-strong bg-white text-ink hover:bg-tile",
          label.tone === "neutral" && "bg-tile text-ink hover:bg-tile-hover",
          label.tone === "muted" && "bg-tile text-muted hover:bg-tile-hover hover:text-ink",
        )}
      >
        {label.label}
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5 shrink-0"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Ombordagi soni"
        lead={<>{name} · hozir: <b className="text-ink">{qty == null ? "kuzatilmaydi" : `${qty} ta`}</b></>}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={secondaryButtonClass}>{state?.ok ? "Yopish" : "Bekor qilish"}</button>
            <button type="submit" form={formId} disabled={pending} className={buttonClass}>{pending ? "Saqlanmoqda…" : "Saqlash"}</button>
          </>
        }
      >
        <form id={formId} action={action} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="mode" value={mode} />
          {state?.error && <Notice tone="error">{state.error}</Notice>}
          {state?.ok && <Notice tone="ok">{state.ok}</Notice>}
          <div role="radiogroup" aria-label="Oʻzgartirish turi" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                ["delta", "Qoʻshish / ayirish"],
                ["set", "Aniq son"],
                ...(qty != null ? ([["untrack", "Kuzatmaslik"]] as const) : []),
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={cn("h-11 rounded-[12px] px-3 text-[14px] font-semibold", mode === value ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover")}
              >
                {text}
              </button>
            ))}
          </div>
          {mode === "delta" && (
            <Field label="Necha dona" hint="Keldi: 24 · Hisobdan chiqarildi: −2">
              <input key="delta" name="value" type="number" step={1} required inputMode="numeric" placeholder="+24 yoki −2" className={inputClass} autoFocus />
            </Field>
          )}
          {mode === "set" && (
            <Field label="Ombordagi aniq soni" hint="Inventarizatsiyadan keyin">
              <input key="set" name="value" type="number" min={0} step={1} required inputMode="numeric" defaultValue={qty ?? ""} className={inputClass} autoFocus />
            </Field>
          )}
          {mode === "untrack" && (
            <p className="rounded-[12px] bg-tile px-4 py-3 text-[14px] leading-5 text-ink-2">Son kuzatilmaydi: saytda son chiqmaydi, buyurtma hech narsani kamaytirmaydi. «Omborda bor» holati oʻzgarmaydi.</p>
          )}
          {mode !== "untrack" && (
            <Field label="Izoh (ixtiyoriy)" hint="Masalan: yetkazib beruvchidan partiya, buzilgan qadoq">
              <input name="note" maxLength={300} className={inputClass} />
            </Field>
          )}
        </form>
      </AdminDialog>
    </>
  );
}

/* The site-wide "kam qoldi" threshold: a product without its own uses this. */
export function LowStockDefaultForm({ value }: { value: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveLowStockDefaultAction, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <Field label="Kam qoldi chegarasi (standart)" hint="Saytda «Omborda N ta qoldi» shu sondan kam yoki teng boʻlganda chiqadi" className="w-full max-w-[360px]">
        <input name="lowStockAt" type="number" min={1} max={1000} step={1} required defaultValue={value} inputMode="numeric" className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={cn(smallButtonClass, "h-12")}>{pending ? "Saqlanmoqda…" : "Saqlash"}</button>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.ok && <Notice tone="ok">{state.ok}</Notice>}
    </form>
  );
}
