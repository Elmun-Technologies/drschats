"use client";

import { useActionState, useState } from "react";
import { saveDeal } from "@/app/admin/_actions/storefront";
import type { FormState } from "@/app/admin/_actions/catalog";
import { discounted } from "@/lib/catalog/deals";
import { Field, Notice, inputClass, som } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { cn } from "@/lib/utils";

export interface DealProductOption {
  slug: string;
  name: string;
  /** The price it sells at today. */
  price: number;
}

export interface DealFormValues {
  id?: number;
  productSlug: string;
  mode: "percent" | "price";
  percent: string;
  price: string;
  startsAt: string;
  endsAt: string;
}

/*
  A deal of the day: one product, a percent or a fixed price, a window. The
  preview line is the same computation the catalogue runs (catalog/deals.ts),
  so what it says is what the site and checkout will charge.
*/
export function DealForm({ values, products }: { values: DealFormValues; products: DealProductOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveDeal, undefined);
  const [v, setV] = useState(values);
  const product = products.find((p) => p.slug === v.productSlug);
  const percent = v.mode === "percent" ? Number(v.percent) || null : null;
  const fixed = v.mode === "price" ? Number(v.price.replace(/\s/g, "")) || null : null;
  const result = product ? discounted(product.price, { percent, price: fixed }) : null;

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-2">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      {state?.error && <div className="lg:col-span-2"><Notice tone="error">{state.error}</Notice></div>}
      {state?.ok && <div className="lg:col-span-2"><Notice tone="ok">{state.ok}</Notice></div>}
      <Field label="Mahsulot" className="lg:col-span-2">
        <select name="productSlug" required value={v.productSlug} onChange={(e) => setV({ ...v, productSlug: e.target.value })} className={inputClass}>
          <option value="">— tanlang —</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name} · {som(p.price)}</option>
          ))}
        </select>
      </Field>
      <fieldset className="lg:col-span-2">
        <legend className="mb-1.5 text-[14px] font-semibold text-ink">Chegirma</legend>
        <div className="flex flex-wrap gap-2">
          {(["percent", "price"] as const).map((mode) => (
            <label key={mode} className={cn("flex h-12 cursor-pointer items-center rounded-[12px] border px-4 text-[15px] font-semibold", v.mode === mode ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink")}>
              <input type="radio" name="mode" value={mode} checked={v.mode === mode} onChange={() => setV({ ...v, mode })} className="sr-only" />
              {mode === "percent" ? "Foiz" : "Yangi narx"}
            </label>
          ))}
        </div>
      </fieldset>
      {v.mode === "percent" ? (
        <Field label="Chegirma foizi" hint="1–90. Narx yuzlikkacha yaxlitlanadi">
          <input name="percent" inputMode="numeric" value={v.percent} onChange={(e) => setV({ ...v, percent: e.target.value })} className={inputClass} />
        </Field>
      ) : (
        <Field label="Taklif narxi, soʻm" hint="Hozirgi narxdan past boʻlsin">
          <input name="price" inputMode="numeric" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} className={inputClass} />
        </Field>
      )}
      <div className="flex items-end">
        <p className="min-h-12 w-full rounded-[12px] bg-tile px-4 py-3 text-[14px] leading-5 text-ink-2">
          {product && result != null ? (
            <>Saytda: <b className="text-ink">{som(result)}</b> <span className="text-muted line-through">{som(product.price)}</span> · −{Math.round((1 - result / product.price) * 100)}%</>
          ) : product ? (
            "Taklif narxi hozirgi narxdan past boʻlishi kerak."
          ) : (
            "Mahsulotni tanlang."
          )}
        </p>
      </div>
      <Field label="Boshlanishi" hint="Toshkent vaqti. Boʻsh — darhol">
        <input name="startsAt" type="datetime-local" value={v.startsAt} onChange={(e) => setV({ ...v, startsAt: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Tugashi" hint="Toshkent vaqti. Shu daqiqada narx odatiy holiga qaytadi">
        <input name="endsAt" type="datetime-local" required value={v.endsAt} onChange={(e) => setV({ ...v, endsAt: e.target.value })} className={inputClass} />
      </Field>
      <div className="lg:col-span-2"><SubmitButton>{v.id ? "Saqlash" : "Taklifni rejalashtirish"}</SubmitButton></div>
    </form>
  );
}
