"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveBanner } from "@/app/admin/_actions/storefront";
import type { FormState } from "@/app/admin/_actions/catalog";
import type { RepoImage } from "@/lib/admin/repo-images";
import { PLACEMENT_LABEL } from "@/lib/merch/model";
import { Field, Notice, inputClass } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUpload, SingleImageField } from "@/components/admin/catalog/ImageFields";
import { cn } from "@/lib/utils";

export interface BannerFormValues {
  id?: number;
  placement: "hero" | "strip" | "category";
  uzTitle: string;
  ruTitle: string;
  uzSubtitle: string;
  ruSubtitle: string;
  uzCta: string;
  ruCta: string;
  href: string;
  image: string;
  imageMobile: string;
  theme: "light" | "dark";
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
  sort: number;
  active: boolean;
}

function Panel({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[17px] font-bold text-ink">{title}</h2>
        {lead && <p className="mt-1 text-[13px] leading-5 text-muted">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

export function BannerForm({ values, repoImages, storageReady }: { values: BannerFormValues; repoImages: RepoImage[]; storageReady: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(saveBanner, undefined);
  const [v, setV] = useState(values);
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const set = <K extends keyof BannerFormValues>(key: K) => (value: BannerFormValues[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const text = (key: keyof BannerFormValues) => ({ value: v[key] as string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key)(e.target.value as never) });

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      {(state?.error || state?.ok) && (
        <div className="xl:col-span-2">{state?.error ? <Notice tone="error">{state.error}</Notice> : <Notice tone="ok">{state?.ok}</Notice>}</div>
      )}
      <div className="flex min-w-0 flex-col gap-5">
        <Panel title="Joyi va koʻrinishi">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Qayerda chiqadi">
              <select name="placement" value={v.placement} onChange={(e) => set("placement")(e.target.value as BannerFormValues["placement"])} className={inputClass}>
                {Object.entries(PLACEMENT_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-[14px] font-semibold text-ink">Fon</legend>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((theme) => (
                  <label key={theme} className={cn("flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] border text-[15px] font-semibold", v.theme === theme ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink")}>
                    <input type="radio" name="theme" value={theme} checked={v.theme === theme} onChange={() => set("theme")(theme)} className="sr-only" />
                    {theme === "light" ? "Ochiq" : "Qora"}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Panel>

        <Panel title="Matn" lead="Ikkala tilda. Tibbiy vaʼda yozmang («davolaydi», «100% natija»). Tugma matni boʻsh boʻlsa tugma chizilmaydi — banner baribir bosiladi.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Sarlavha (uz)"><input name="uz.title" required minLength={2} maxLength={90} {...text("uzTitle")} className={inputClass} /></Field>
            <Field label="Sarlavha (ru)"><input name="ru.title" required minLength={2} maxLength={90} {...text("ruTitle")} className={inputClass} /></Field>
            <Field label="Qoʻshimcha matn (uz)" hint="160 belgigacha"><input name="uz.subtitle" maxLength={160} {...text("uzSubtitle")} className={inputClass} /></Field>
            <Field label="Qoʻshimcha matn (ru)" hint="160 belgigacha"><input name="ru.subtitle" maxLength={160} {...text("ruSubtitle")} className={inputClass} /></Field>
            <Field label="Tugma (uz)" hint="Masalan: «Batafsil»"><input name="uz.cta" maxLength={30} {...text("uzCta")} className={inputClass} /></Field>
            <Field label="Tugma (ru)" hint="Например: «Подробнее»"><input name="ru.cta" maxLength={30} {...text("ruCta")} className={inputClass} /></Field>
            <Field label="Havola" hint="Saytdagi yoʻl (/product/omega-3, /sale, /products?sale=1) yoki https:// manzil" className="lg:col-span-2">
              <input name="href" required {...text("href")} placeholder="/product/…" className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Rasm" lead="Fonsiz kesma (c-*.png) eng yaxshi koʻrinadi. Telefon uchun alohida rasm ixtiyoriy.">
          <SingleImageField
            name="image"
            label="Asosiy rasm"
            value={v.image}
            onChange={set("image")}
            repoImages={repoImages}
            initialKind="cutout"
            emptyText="Rasmsiz"
          />
          <ImageUpload ready={storageReady} onUploaded={set("image")} />
          <div className="border-t border-line pt-4">
            <SingleImageField
              name="imageMobile"
              label="Telefon uchun rasm (ixtiyoriy)"
              value={v.imageMobile}
              onChange={set("imageMobile")}
              repoImages={repoImages}
              initialKind="cutout"
              emptyText="Asosiy rasm"
            />
          </div>
        </Panel>

        <Panel title="Muddat" lead="Toshkent vaqti. Boshlanishi boʻsh — darhol; tugashi boʻsh — muddatsiz. Banner tugash vaqtida saytdan oʻzi yoʻqoladi.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Boshlanishi"><input name="startsAt" type="datetime-local" {...text("startsAt")} className={inputClass} /></Field>
            <Field label="Tugashi"><input name="endsAt" type="datetime-local" {...text("endsAt")} className={inputClass} /></Field>
            <label className={cn("flex min-h-12 items-center gap-3 text-[15px] font-semibold", v.endsAt ? "text-ink" : "text-muted")}>
              <input
                type="checkbox"
                name="showCountdown"
                checked={v.showCountdown && Boolean(v.endsAt)}
                disabled={!v.endsAt}
                onChange={(e) => set("showCountdown")(e.target.checked)}
                className="h-5 w-5 accent-ink"
              />
              Taymer koʻrsatish {!v.endsAt && <span className="text-[13px] font-normal">(tugash vaqti kerak)</span>}
            </label>
            <Field label="Tartib" hint="Kichik raqam — oldinroq"><input name="sort" type="number" value={v.sort} onChange={(e) => set("sort")(Number(e.target.value))} className={inputClass} /></Field>
            <label className="flex min-h-12 items-center gap-3 text-[15px] font-semibold text-ink">
              <input type="checkbox" name="active" checked={v.active} onChange={(e) => set("active")(e.target.checked)} className="h-5 w-5 accent-ink" />
              Faol
            </label>
          </div>
        </Panel>
        <div><SubmitButton>{v.id ? "Saqlash" : "Bannerni yaratish"}</SubmitButton></div>
      </div>

      <aside className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-bold text-ink">Koʻrinishi</h2>
          <div role="group" aria-label="Koʻrinish tili" className="flex gap-1">
            {(["uz", "ru"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={cn("h-11 min-w-11 rounded-[12px] px-3 text-[14px] font-semibold uppercase", lang === l ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <Preview v={v} lang={lang} />
        <p className="text-[13px] leading-5 text-muted">Taxminiy koʻrinish. Taymer saytda tugash vaqtigacha qolgan vaqtni koʻrsatadi.</p>
      </aside>
    </form>
  );
}

function Preview({ v, lang }: { v: BannerFormValues; lang: "uz" | "ru" }) {
  const dark = v.theme === "dark";
  const title = (lang === "uz" ? v.uzTitle : v.ruTitle) || "Sarlavha";
  const subtitle = lang === "uz" ? v.uzSubtitle : v.ruSubtitle;
  const cta = lang === "uz" ? v.uzCta : v.ruCta;
  const image = v.image.trim();
  const countdown = v.showCountdown && v.endsAt ? (lang === "uz" ? "Aksiya tugashiga: 05:12:33" : "До конца акции: 05:12:33") : null;

  if (v.placement === "strip") {
    return (
      <div className={cn("flex min-h-11 flex-wrap items-center justify-center gap-x-3 rounded-[12px] px-4 py-2 text-center text-[13px]", dark ? "bg-dark-panel text-white" : "bg-yellow-banner text-ink")}>
        <span className="font-semibold">{title}</span>
        {subtitle && <span className={dark ? "text-on-dark-2" : "text-ink-2"}>{subtitle}</span>}
        {countdown && <span className="font-bold tabular-nums">05:12:33</span>}
        {cta && <span className="font-semibold underline underline-offset-4">{cta}</span>}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_120px] items-center gap-3 overflow-hidden rounded-[24px] p-5", dark ? "bg-dark-panel text-white" : "bg-tile text-ink", v.placement === "hero" && "min-h-[240px]")}>
      <div className="flex flex-col items-start gap-2">
        <span className={cn("font-bold", v.placement === "hero" ? "text-[22px] leading-7" : "text-lg leading-6")}>{title}</span>
        {subtitle && <span className={cn("text-[14px] leading-5", dark ? "text-on-dark-2" : "text-ink-2")}>{subtitle}</span>}
        {countdown && <span className={cn("text-[13px]", dark ? "text-on-dark-2" : "text-ink-2")}>{countdown}</span>}
        {cta && <span className={cn("mt-1 inline-flex h-10 items-center rounded-[12px] px-4 text-[14px] font-semibold", dark ? "bg-white text-ink" : "bg-ink text-white")}>{cta}</span>}
      </div>
      <span className="relative h-[120px] w-[120px]">
        {image && <Image src={image} alt="" fill unoptimized={!isLocal(image)} sizes="120px" className="object-contain" />}
      </span>
    </div>
  );
}
