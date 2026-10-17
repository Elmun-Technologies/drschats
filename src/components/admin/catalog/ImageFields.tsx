"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadProductImage, type FormState } from "@/app/admin/_actions/catalog";
import type { RepoImage, RepoImageKind } from "@/lib/admin/repo-images";
import { Field, inputClass, secondaryButtonClass, smallButtonClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { ImagePicker } from "./ImagePicker";

const iconButton =
  "grid h-11 w-11 place-items-center rounded-[12px] bg-tile text-ink transition-colors hover:bg-tile-hover disabled:opacity-40 disabled:hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/* Remote URLs may sit on hosts the optimizer does not proxy; the repo's own files go through it. */
const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

/*
  The product's photos as thumbnails: first = main photo, arrows reorder,
  ✕ removes. The value travels as one newline-separated `images` field —
  the same format saveProduct and the codec have always read.
*/
export function ImageListField({
  name,
  value,
  onChange,
  repoImages,
  slug,
  storageReady,
}: {
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  repoImages: RepoImage[];
  slug: string;
  storageReady: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [url, setUrl] = useState("");
  const add = (src: string) => {
    const clean = src.trim();
    if (clean && !value.includes(clean)) onChange([...value, clean]);
  };
  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={name} value={value.join("\n")} />
      {value.length > 0 ? (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
          {value.map((src, i) => (
            <li key={src} className="flex min-w-0 flex-col gap-2 rounded-[16px] border border-line p-2">
              <span className="relative block aspect-square overflow-hidden rounded-[12px] bg-tile">
                <Image src={src} alt={`Rasm ${i + 1}`} fill unoptimized={!isLocal(src)} sizes="200px" className="object-contain p-2" />
                <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[12px] font-semibold", i === 0 ? "bg-ink text-white" : "bg-white text-ink")}>
                  {i === 0 ? "Asosiy" : i + 1}
                </span>
              </span>
              <span className="truncate px-0.5 text-[12px] text-muted" title={src}>{src.split("/").pop()}</span>
              <span className="flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`${i + 1}-rasmni oldinga surish`} className={iconButton}><Arrow dir="left" /></button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label={`${i + 1}-rasmni orqaga surish`} className={iconButton}><Arrow dir="right" /></button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`${i + 1}-rasmni olib tashlash`}
                  className="ml-auto grid h-11 w-11 place-items-center rounded-[12px] text-red transition-colors hover:bg-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/30"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-[16px] bg-tile px-4 py-6 text-center text-[14px] text-muted">Hali rasm yoʻq — saytdagi rasmlardan tanlang{storageReady ? ", yuklang" : ""} yoki manzilini kiriting.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setPickerOpen(true)} className={secondaryButtonClass}>Saytdagi rasmlardan tanlash</button>
        <ImageUpload ready={storageReady} onUploaded={add} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${name}-url`} className="text-[14px] font-semibold text-ink">Manzil boʻyicha qoʻshish</label>
        <div className="flex gap-2">
          <input
            id={`${name}-url`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(url);
                setUrl("");
              }
            }}
            placeholder="https://… yoki /products/…"
            className={inputClass}
          />
          <button type="button" onClick={() => { add(url); setUrl(""); }} disabled={!url.trim()} className={cn(smallButtonClass, "h-12 shrink-0 disabled:opacity-50")}>Qoʻshish</button>
        </div>
      </div>

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        images={repoImages}
        mode="multi"
        selected={value}
        onPick={add}
        slug={slug}
        title="Rasm tanlash"
        initialKind="photo"
      />
    </div>
  );
}

/* One image (a product's cutout, a category picture): preview, pick from the repo, or type a URL. */
export function SingleImageField({
  name,
  label,
  hint,
  value,
  onChange,
  repoImages,
  slug,
  initialKind,
  emptyText,
}: {
  name: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  repoImages: RepoImage[];
  slug?: string;
  initialKind?: RepoImageKind;
  emptyText: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const src = value.trim();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[16px] bg-tile">
          {src ? (
            <Image src={src} alt={label} fill unoptimized={!isLocal(src)} sizes="96px" className="object-contain p-2" />
          ) : (
            <span className="px-2 text-center text-[12px] leading-4 text-muted">{emptyText}</span>
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPickerOpen(true)} className={smallButtonClass}>{src ? "Almashtirish" : "Tanlash"}</button>
          {src && <button type="button" onClick={() => onChange("")} className="inline-flex h-11 items-center rounded-[12px] px-3.5 text-[14px] font-semibold text-red hover:bg-tile">Olib tashlash</button>}
        </div>
      </div>
      <Field label={label} hint={hint}>
        <input name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/products/c-….png" className={inputClass} />
      </Field>
      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        images={repoImages}
        mode="single"
        selected={src ? [src] : []}
        onPick={onChange}
        slug={slug}
        title={label}
        initialKind={initialKind}
      />
    </div>
  );
}

export function ImageUpload({ ready, onUploaded }: { ready: boolean; onUploaded: (url: string) => void }) {
  const [state, setState] = useState<FormState & { url?: string }>();
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  if (!ready) {
    return <p className="text-[13px] text-muted">Yangi faylni yuklash uchun Tigris sozlanishi kerak (docs/ADMIN.md).</p>;
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
      <label className={cn(secondaryButtonClass, "cursor-pointer focus-within:ring-2 focus-within:ring-ink/30")}>
        {pending ? "Yuklanmoqda…" : "Kompyuterdan yuklash"}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onChange} className="sr-only" />
      </label>
      {state?.error && <span role="alert" className="text-[14px] text-red">{state.error}</span>}
      {state?.ok && <span className="text-[14px] text-ink-2">{state.ok}</span>}
    </div>
  );
}
