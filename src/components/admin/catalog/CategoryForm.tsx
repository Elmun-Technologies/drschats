"use client";

import { useActionState, useState } from "react";
import { saveCategory, type FormState } from "@/app/admin/_actions/catalog";
import { slugify } from "@/lib/admin/slugify";
import type { RepoImage } from "@/lib/admin/repo-images";
import { Field, Notice, inputClass, textareaClass } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { SingleImageField } from "./ImageFields";

export interface CategoryFormValues {
  slug: string;
  uzName: string;
  ruName: string;
  uzDescription: string;
  ruDescription: string;
  image: string;
  sort: number;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <h2 className="text-[17px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/* New and edit share one form; `original` tells saveCategory which row to update. */
export function CategoryForm({ values, repoImages, editing }: { values: CategoryFormValues; repoImages: RepoImage[]; editing: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(saveCategory, undefined);
  const [uzName, setUzName] = useState(values.uzName);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(editing);
  const [image, setImage] = useState(values.image);
  const effectiveSlug = slug.trim() || slugify(uzName);

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {editing && <input type="hidden" name="original" value={values.slug} />}
      {(state?.error || state?.ok) && (
        <div className="xl:col-span-2">{state?.error ? <Notice tone="error">{state.error}</Notice> : <Notice tone="ok">{state?.ok}</Notice>}</div>
      )}
      <div className="flex min-w-0 flex-col gap-5">
        <Panel title="Nomi va tavsifi">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nomi (uz)">
              <input
                name="uz.name"
                value={uzName}
                onChange={(e) => {
                  setUzName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                required
                minLength={2}
                maxLength={80}
                className={inputClass}
              />
            </Field>
            <Field label="Nomi (ru)">
              <input name="ru.name" defaultValue={values.ruName} required minLength={2} maxLength={80} className={inputClass} />
            </Field>
            <Field label="Tavsif (uz)" hint="Kategoriya sahifasining yuqorisida; 400 belgigacha">
              <textarea name="uz.description" defaultValue={values.uzDescription} rows={3} maxLength={400} className={textareaClass} />
            </Field>
            <Field label="Tavsif (ru)" hint="400 belgigacha">
              <textarea name="ru.description" defaultValue={values.ruDescription} rows={3} maxLength={400} className={textareaClass} />
            </Field>
          </div>
        </Panel>
        <Panel title="Rasm">
          <SingleImageField
            name="image"
            label="Rasm manzili"
            hint="Katalog menyusida va kategoriya kartasida chiqadi. Fonsiz kesma rasm eng yaxshi koʻrinadi."
            value={image}
            onChange={setImage}
            repoImages={repoImages}
            initialKind="cutout"
            emptyText="Rasm yoʻq"
          />
        </Panel>
      </div>
      <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Manzil va tartib">
          <Field label="Sahifa manzili (slug)" hint={effectiveSlug ? `govita.uz/uz/products/${effectiveSlug}` : "Oʻzbekcha nomdan avtomatik yaratiladi"}>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder={slugify(uzName) || "masalan: omega-3"}
              className={inputClass}
            />
          </Field>
          {editing && slug.trim() && slug.trim() !== values.slug && (
            <p className="text-[13px] leading-5 text-ink-2">Manzil oʻzgarsa, mahsulotlar yangi kategoriyaga oʻzi oʻtadi, lekin eski havola (/products/{values.slug}) 404 boʻladi.</p>
          )}
          <Field label="Tartib" hint="Kichik raqam — menyuda oldinroq">
            <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
          </Field>
        </Panel>
        <div className="sticky bottom-0 -mx-4 border-t border-line bg-bg px-4 py-3 xl:static xl:mx-0 xl:border-0 xl:bg-transparent xl:p-0">
          <SubmitButton className="w-full">{editing ? "Saqlash" : "Kategoriyani yaratish"}</SubmitButton>
        </div>
      </aside>
    </form>
  );
}
