"use client";

import Image from "next/image";
import { useActionState, useMemo, useRef, useState } from "react";
import { saveProduct, uploadProductImage, type FormState } from "@/app/admin/_actions/catalog";
import { Field, Notice, inputClass, secondaryButtonClass, smallButtonClass, textareaClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
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

/** "Swiss Energy Omega-3 30" → "swiss-energy-omega-3-30"; Uzbek and Russian letters folded to Latin. */
export function slugify(text: string): string {
  const ru: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h" };
  return text
    .toLowerCase()
    .replace(/[\u02bb\u02bc\u2018\u2019'`]/g, "")
    .replace(/[а-яёўқғҳ]/g, (ch) => ru[ch] ?? "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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
}: {
  values: ProductFormValues;
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  storageReady: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveProduct, undefined);
  const [tab, setTab] = useState<"uz" | "ru">("uz");
  const [images, setImages] = useState(values.images);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.id));
  const [price, setPrice] = useState(values.price);
  const [oldPrice, setOldPrice] = useState(values.oldPrice);
  const c = (k: string) => values.content[k] ?? "";
  const imageList = useMemo(() => images.split(/\r?\n/).map((u) => u.trim()).filter(Boolean), [images]);
  const discount = Number(oldPrice) > Number(price) && Number(price) > 0 ? Math.round((1 - Number(price) / Number(oldPrice)) * 100) : 0;
  const setList = (list: string[]) => setImages(list.join("\n"));

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {(state?.error || state?.ok) && (
        <div className="xl:col-span-2">{state?.error ? <Notice tone="error">{state.error}</Notice> : <Notice tone="ok">{state?.ok}</Notice>}</div>
      )}

      <div className="flex min-w-0 flex-col gap-5">
        <Panel title="Rasmlar">
          {imageList.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
              {imageList.map((url, i) => (
                <li key={`${url}-${i}`} className="flex flex-col gap-2">
                  <span className="relative block aspect-square overflow-hidden rounded-[16px] bg-tile">
                    <Image src={url} alt="" fill unoptimized sizes="160px" className="object-contain p-2" />
                    {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[12px] font-semibold text-white">Asosiy</span>}
                  </span>
                  <span className="flex gap-1">
                    {i > 0 && <button type="button" onClick={() => setList([url, ...imageList.filter((_, j) => j !== i)])} className="h-9 whitespace-nowrap rounded-[10px] bg-tile px-2.5 text-[13px] font-semibold text-ink hover:bg-tile-hover">Asosiy</button>}
                    <button type="button" onClick={() => setList(imageList.filter((_, j) => j !== i))} aria-label="Rasmni olib tashlash" className="h-9 whitespace-nowrap rounded-[10px] px-2.5 text-[13px] font-semibold text-red hover:bg-tile">Oʻchirish</button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[16px] bg-tile px-4 py-6 text-center text-[14px] text-muted">Hali rasm yoʻq — yuklang yoki manzilini kiriting</p>
          )}
          <ImageUpload ready={storageReady} onUploaded={(url) => setImages((v) => (v.trim() ? `${v.trim()}\n${url}` : url))} />
          <Field label="Rasm manzillari" hint="Har qatorda bitta (https://… yoki /images/products/…). Birinchisi — asosiy.">
            <textarea name="images" value={images} onChange={(e) => setImages(e.target.value)} rows={3} className={textareaClass} />
          </Field>
          <Field label="Kesma rasm (fonsiz PNG)" hint="Kartada shu chiziladi; boʻsh boʻlsa birinchi rasm">
            <input name="cutout" defaultValue={values.cutout} className={inputClass} />
          </Field>
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
          <Field label="Kategoriya">
            <select name="categorySlug" defaultValue={values.categorySlug} required className={inputClass}>
              <option value="">— tanlang —</option>
              {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
            </select>
          </Field>
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
    if (file.size > 5 * 1024 * 1024) {
      setState({ error: "Fayl 5 MB dan katta." });
      if (input.current) input.current.value = "";
      return;
    }
    setPending(true);
    const fd = new FormData();
    fd.set("file", file);
    try {
      const result = await uploadProductImage(undefined, fd);
      setState(result);
      if (result?.url) onUploaded(result.url);
    } catch {
      setState({ error: "Yuklab boʻlmadi — internetni tekshirib qayta urinib koʻring." });
    } finally {
      setPending(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className={cn(secondaryButtonClass, "cursor-pointer")}>
        {pending ? "Yuklanmoqda…" : "Rasm yuklash"}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onChange} className="sr-only" />
      </label>
      {state?.error && <span className="text-[14px] text-red">{state.error}</span>}
      {state?.ok && <span className="text-[14px] text-ink-2">{state.ok}</span>}
    </div>
  );
}
