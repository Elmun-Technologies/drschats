"use client";

import { useActionState, useState } from "react";
import { saveProduct, type FormState } from "@/app/admin/_actions/catalog";
import { slugify } from "@/lib/admin/slugify";
import type { RepoImage } from "@/lib/admin/repo-images";
import { Field, Notice, inputClass, textareaClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { ImageListField, SingleImageField } from "./catalog/ImageFields";
import { QuickCategoryDialog } from "./catalog/QuickCategoryDialog";
import { cn } from "@/lib/utils";

export interface ProductFormValues {
  id?: string;
  slug: string;
  categorySlug: string;
  brandSlug: string;
  price: string;
  oldPrice: string;
  /** Tashkent time, "YYYY-MM-DDTHH:mm"; empty = the sale has no end date. */
  saleEndsAt: string;
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

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5", className)}>
      <h2 className="text-[17px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function ProductForm({
  values,
  categories,
  brands,
  storageReady,
  repoImages,
}: {
  values: ProductFormValues;
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  storageReady: boolean;
  repoImages: RepoImage[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveProduct, undefined);
  const [tab, setTab] = useState<"uz" | "ru">("uz");
  const [images, setImages] = useState(() => [...new Set(values.images.split(/\r?\n/).map((u) => u.trim()).filter(Boolean))]);
  const [cutout, setCutout] = useState(values.cutout);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.id));
  const [price, setPrice] = useState(values.price);
  const [oldPrice, setOldPrice] = useState(values.oldPrice);
  const [categoryList, setCategoryList] = useState(categories);
  const [categorySlug, setCategorySlug] = useState(values.categorySlug);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const c = (k: string) => values.content[k] ?? "";
  const discount = Number(oldPrice) > Number(price) && Number(price) > 0 ? Math.round((1 - Number(price) / Number(oldPrice)) * 100) : 0;

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {(state?.error || state?.ok) && (
        <div className="xl:col-span-2">{state?.error ? <Notice tone="error">{state.error}</Notice> : <Notice tone="ok">{state?.ok}</Notice>}</div>
      )}

      <div className="flex min-w-0 flex-col gap-5">
        <Panel title="Rasmlar">
          <p className="-mt-2 text-[14px] leading-5 text-ink-2">Birinchi rasm — asosiy: mahsulot sahifasida birinchi chiqadi. Strelkalar bilan tartibini oʻzgartiring.</p>
          <ImageListField name="images" value={images} onChange={setImages} repoImages={repoImages} slug={slug} storageReady={storageReady} />
        </Panel>
        <Panel title="Kesma rasm (fonsiz PNG)">
          <SingleImageField
            name="cutout"
            label="Kesma rasm manzili"
            hint="Katalog kartasida shu chiziladi; boʻsh boʻlsa birinchi rasm"
            value={cutout}
            onChange={setCutout}
            repoImages={repoImages}
            slug={slug}
            initialKind="cutout"
            emptyText="Kesma yoʻq"
          />
        </Panel>
        <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 lg:p-6">
          <div role="tablist" aria-label="Til" className="flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="tab"
                aria-selected={tab === l.code}
                onClick={() => setTab(l.code)}
                className={cn("h-11 rounded-[12px] px-4 text-[15px] font-semibold", tab === l.code ? "bg-ink text-white" : "bg-tile text-ink-2")}
              >
                {l.label}
              </button>
            ))}
          </div>
        {LOCALES.map((l) => (
          // Both languages stay in the DOM (hidden, not unmounted) so one submit saves both.
          <div key={l.code} role="tabpanel" hidden={tab !== l.code} className="grid gap-4 lg:grid-cols-2">
            <Field label="Nomi" className="lg:col-span-2">
              <input name={`${l.code}.name`} defaultValue={c(`${l.code}.name`)} required={l.code === "uz"} onChange={l.code === "uz" ? (e) => onNameChange(e.target.value) : undefined} className={inputClass} />
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

      </div>

      <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Holat">
          <Field label="Koʻrinishi">
            <select name="kind" defaultValue={values.kind} className={inputClass}>
              <option value="core">Asosiy assortiment</option>
              <option value="addon">Qoʻshimcha (aksessuar, qahva…)</option>
              <option value="unlisted">Sotuvdan olingan (koʻrinmaydi)</option>
            </select>
          </Field>
          <label className="flex min-h-11 items-center gap-3 text-[15px] font-semibold">
            <input name="inStock" type="checkbox" defaultChecked={values.inStock} className="h-5 w-5 accent-ink" />
            Omborda bor
          </label>
        </Panel>
        <Panel title="Narx">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Narx, soʻm">
              <input name="price" type="number" min={0} step={100} value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
            </Field>
            <Field label="Eski narx">
              <input name="oldPrice" type="number" min={0} step={100} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className={inputClass} />
            </Field>
          </div>
          {discount > 0 && <p className="text-[14px] text-ink-2">Saytda chegirma: <span className="rounded-full bg-red px-2 py-0.5 text-[13px] font-semibold text-white">−{discount}%</span></p>}
          <Field label="Aksiya tugashi" hint="Toshkent vaqti. Oʻtgach narx eski narxga qaytadi">
            <input name="saleEndsAt" type="datetime-local" defaultValue={values.saleEndsAt} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qadoqda (dona)">
              <input name="unitCount" type="number" min={1} defaultValue={values.unitCount} className={inputClass} />
            </Field>
            <Field label="Birlik">
              <select name="unitKind" defaultValue={values.unitKind} className={inputClass}>
                <option value="">—</option>
                <option value="tablet">tabletka</option>
                <option value="capsule">kapsula</option>
              </select>
            </Field>
          </div>
        </Panel>
        <Panel title="Tashkil etish">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="product-category" className="text-[14px] font-semibold text-ink">Kategoriya</label>
              <button type="button" onClick={() => setNewCategoryOpen(true)} className="-my-2 inline-flex h-11 items-center rounded-[12px] px-2 text-[14px] font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
                + Yangi kategoriya
              </button>
            </div>
            <select id="product-category" name="categorySlug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} required className={inputClass}>
              <option value="">— tanlang —</option>
              {categoryList.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
            </select>
          </div>
          <QuickCategoryDialog
            open={newCategoryOpen}
            onClose={() => setNewCategoryOpen(false)}
            onCreated={(cat) => {
              setCategoryList((list) => [...list, cat]);
              setCategorySlug(cat.slug);
            }}
          />
          <Field label="Brend">
            <select name="brandSlug" defaultValue={values.brandSlug} className={inputClass}>
              <option value="">— yoʻq —</option>
              {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Sahifa manzili (slug)" hint={slug ? `govita.uz/uz/product/${slug}` : "Oʻzbekcha nomdan avtomatik yaratiladi"}>
            <input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
          </Field>
          <Field label="Tartib" hint="Kichik raqam — roʻyxatda oldinroq">
            <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
          </Field>
        </Panel>
        <div className="sticky bottom-0 -mx-4 border-t border-line bg-bg px-4 py-3 xl:static xl:mx-0 xl:border-0 xl:bg-transparent xl:p-0">
          <SubmitButton className="w-full">{values.id ? "Saqlash" : "Mahsulotni yaratish"}</SubmitButton>
        </div>
      </aside>
    </form>
  );

  function onNameChange(name: string) {
    if (!slugTouched) setSlug(slugify(name));
  }
}
