"use client";

import { useActionState, useRef, useState } from "react";
import { saveProduct, uploadProductImage, type FormState } from "@/app/admin/_actions/catalog";
import { Field, Notice, inputClass, secondaryButtonClass, textareaClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { cn } from "@/lib/utils";

export interface ProductFormValues {
  id?: string;
  slug: string;
  categorySlug: string;
  brandSlug: string;
  price: string;
  oldPrice: string;
  inStock: boolean;
  kind: "core" | "addon" | "unlisted";
  sort: string;
  images: string;
  cutout: string;
  unitCount: string;
  unitKind: "" | "tablet" | "capsule";
  /** "uz.name", "ru.faq", … — see lib/admin/product-form.ts */
  content: Record<string, string>;
}

const LOCALES = [
  { code: "uz", label: "Oʻzbekcha" },
  { code: "ru", label: "Русский" },
] as const;

const LIST_HINT = "Har bir qator — bitta element";

export function ProductForm({
  values,
  categories,
  brands,
  storageReady,
}: {
  values: ProductFormValues;
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  storageReady: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveProduct, undefined);
  const [tab, setTab] = useState<"uz" | "ru">("uz");
  const [images, setImages] = useState(values.images);
  const c = (k: string) => values.content[k] ?? "";

  return (
    <form action={action} className="flex flex-col gap-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.ok && <Notice tone="ok">{state.ok}</Notice>}

      <section className="grid gap-4 rounded-[20px] bg-bg p-5 lg:grid-cols-3 lg:p-6">
        <Field label="Slug (URL)" hint="Masalan: swiss-energy-omega-3-30" className="lg:col-span-2">
          <input name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
        </Field>
        <Field label="Tartib" hint="Kichik raqam — oldinda">
          <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
        </Field>
        <Field label="Kategoriya">
          <select name="categorySlug" defaultValue={values.categorySlug} required className={inputClass}>
            <option value="">— tanlang —</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Brend">
          <select name="brandSlug" defaultValue={values.brandSlug} className={inputClass}>
            <option value="">— yoʻq —</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Holat">
          <select name="kind" defaultValue={values.kind} className={inputClass}>
            <option value="core">Asosiy assortiment</option>
            <option value="addon">Qoʻshimcha (aksessuar, qahva…)</option>
            <option value="unlisted">Sotuvdan olingan (koʻrinmaydi)</option>
          </select>
        </Field>
        <Field label="Narx, soʻm">
          <input name="price" type="number" min={0} step={100} defaultValue={values.price} required className={inputClass} />
        </Field>
        <Field label="Eski narx, soʻm" hint="Faqat haqiqiy chegirma boʻlsa">
          <input name="oldPrice" type="number" min={0} step={100} defaultValue={values.oldPrice} className={inputClass} />
        </Field>
        <label className="flex h-11 items-center gap-3 self-end text-[15px] font-semibold">
          <input name="inStock" type="checkbox" defaultChecked={values.inStock} className="h-5 w-5 accent-ink" />
          Omborda bor
        </label>
        <Field label="Qadoqdagi soni" hint="Birlik narxi uchun (ixtiyoriy)">
          <input name="unitCount" type="number" min={1} defaultValue={values.unitCount} className={inputClass} />
        </Field>
        <Field label="Birlik">
          <select name="unitKind" defaultValue={values.unitKind} className={inputClass}>
            <option value="">—</option>
            <option value="tablet">tabletka</option>
            <option value="capsule">kapsula</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-[20px] bg-bg p-5 lg:p-6">
        <h2 className="text-lg font-bold">Rasmlar</h2>
        <Field label="Rasm manzillari" hint="Har qatorda bitta URL (https://… yoki /products/…). Birinchisi — asosiy.">
          <textarea name="images" value={images} onChange={(e) => setImages(e.target.value)} rows={4} className={textareaClass} />
        </Field>
        <ImageUpload ready={storageReady} onUploaded={(url) => setImages((v) => (v.trim() ? `${v.trim()}\n${url}` : url))} />
        <Field label="Kesma rasm (fon olib tashlangan PNG)" hint="Kartada shu chiziladi; boʻsh boʻlsa birinchi rasm">
          <input name="cutout" defaultValue={values.cutout} className={inputClass} />
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-[20px] bg-bg p-5 lg:p-6">
        <div role="tablist" aria-label="Til" className="flex gap-2">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={tab === l.code}
              onClick={() => setTab(l.code)}
              className={cn("h-11 rounded-sm px-4 text-[15px] font-semibold", tab === l.code ? "bg-ink text-white" : "bg-tile text-ink-2")}
            >
              {l.label}
            </button>
          ))}
        </div>
        {LOCALES.map((l) => (
          // Both languages stay in the DOM (hidden, not unmounted) so one submit saves both.
          <div key={l.code} role="tabpanel" hidden={tab !== l.code} className="grid gap-4 lg:grid-cols-2">
            <Field label="Nomi" className="lg:col-span-2">
              <input name={`${l.code}.name`} defaultValue={c(`${l.code}.name`)} className={inputClass} />
            </Field>
            <Field label="Qisqa tavsif (tagline)" hint="Kartada va qidiruv natijasida" className="lg:col-span-2">
              <input name={`${l.code}.tagline`} defaultValue={c(`${l.code}.tagline`)} className={inputClass} />
            </Field>
            <Field label="Toʻliq tavsif" className="lg:col-span-2">
              <textarea name={`${l.code}.description`} defaultValue={c(`${l.code}.description`)} rows={5} className={textareaClass} />
            </Field>
            <Field label="Qoʻllash" className="lg:col-span-2">
              <textarea name={`${l.code}.howToUse`} defaultValue={c(`${l.code}.howToUse`)} rows={3} className={textareaClass} />
            </Field>
            <Field label="Qadoq (masalan: 30 kapsula)">
              <input name={`${l.code}.servings`} defaultValue={c(`${l.code}.servings`)} className={inputClass} />
            </Field>
            <Field label="Ishlab chiqarilgan joy">
              <input name={`${l.code}.origin`} defaultValue={c(`${l.code}.origin`)} className={inputClass} />
            </Field>
            <Field label="Asosiy jihatlar" hint={LIST_HINT}>
              <textarea name={`${l.code}.highlights`} defaultValue={c(`${l.code}.highlights`)} rows={4} className={textareaClass} />
            </Field>
            <Field label="Belgilar (badge)" hint={LIST_HINT}>
              <textarea name={`${l.code}.badges`} defaultValue={c(`${l.code}.badges`)} rows={4} className={textareaClass} />
            </Field>
            <Field label="Foydalari" hint="Sarlavha | tavsif | ikonka (ixtiyoriy)" className="lg:col-span-2">
              <textarea name={`${l.code}.benefits`} defaultValue={c(`${l.code}.benefits`)} rows={4} className={textareaClass} />
            </Field>
            <Field label="Tarkibi" hint="Modda | miqdori | kunlik meʼyor % (ixtiyoriy)" className="lg:col-span-2">
              <textarea name={`${l.code}.ingredients`} defaultValue={c(`${l.code}.ingredients`)} rows={6} className={textareaClass} />
            </Field>
            <Field label="Savol-javob" hint="Savol | Javob — har qatorda bittasi" className="lg:col-span-2">
              <textarea name={`${l.code}.faq`} defaultValue={c(`${l.code}.faq`)} rows={4} className={textareaClass} />
            </Field>
            <Field label="Qoʻshimcha qidiruv soʻzlari" hint="Kartada koʻrinmaydi; har qatorda bittasi" className="lg:col-span-2">
              <textarea name={`${l.code}.searchAliases`} defaultValue={c(`${l.code}.searchAliases`)} rows={2} className={textareaClass} />
            </Field>
          </div>
        ))}
      </section>

      <div className="sticky bottom-0 -mx-4 flex gap-3 bg-tile/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:bg-transparent lg:p-0">
        <SubmitButton>Saqlash</SubmitButton>
      </div>
    </form>
  );
}

function ImageUpload({ ready, onUploaded }: { ready: boolean; onUploaded: (url: string) => void }) {
  const [state, setState] = useState<FormState & { url?: string }>();
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  if (!ready) {
    return <p className="text-[13px] text-muted">Fayl yuklash uchun Tigris sozlanishi kerak (docs/ADMIN.md). Hozircha URL kiriting.</p>;
  }

  async function onChange() {
    const file = input.current?.files?.[0];
    if (!file) return;
    setPending(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadProductImage(undefined, fd);
    setPending(false);
    setState(result);
    if (result?.url) onUploaded(result.url);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className={cn(secondaryButtonClass, "cursor-pointer")}>
        {pending ? "Yuklanmoqda…" : "Rasm yuklash"}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onChange} className="sr-only" />
      </label>
      {state?.error && <span className="text-sm text-red">{state.error}</span>}
      {state?.ok && <span className="text-sm text-ink-2">{state.ok}</span>}
    </div>
  );
}
