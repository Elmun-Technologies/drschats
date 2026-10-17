"use client";

import { useState } from "react";
import { quickCreateCategory } from "@/app/admin/_actions/catalog";
import { slugify } from "@/lib/admin/slugify";
import { Field, Notice, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/ui";
import { AdminDialog } from "./AdminDialog";

/*
  "+ Yangi kategoriya" from inside the product form. No <form> here: the
  dialog is portalled out of the product form and submits through the server
  action directly, so the product's unsaved fields stay as they are.
  Description and picture can be added later on the category's own page.
*/
export function QuickCategoryDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (cat: { slug: string; name: string }) => void }) {
  const [uz, setUz] = useState("");
  const [ru, setRu] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const preview = slug.trim() || slugify(uz);

  async function submit() {
    setPending(true);
    setError(undefined);
    const fd = new FormData();
    fd.set("uz.name", uz);
    fd.set("ru.name", ru);
    fd.set("slug", slug);
    try {
      const result = await quickCreateCategory(fd);
      if (result.error || !result.slug) {
        setError(result.error ?? "Saqlab boʻlmadi.");
        return;
      }
      onCreated({ slug: result.slug, name: result.name ?? uz });
      setUz("");
      setRu("");
      setSlug("");
      onClose();
    } catch {
      setError("Saqlab boʻlmadi — internetni tekshirib qayta urinib koʻring.");
    } finally {
      setPending(false);
    }
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!pending) void submit();
    }
  };

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Yangi kategoriya"
      lead="Yaratilgach shu mahsulotga tanlanadi. Tavsif va rasmni keyin «Kategoriyalar» boʻlimida qoʻshasiz."
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Bekor qilish</button>
          <button type="button" onClick={() => void submit()} disabled={pending} className={buttonClass}>{pending ? "Saqlanmoqda…" : "Yaratish"}</button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="Nomi (uz)">
          <input value={uz} onChange={(e) => setUz(e.target.value)} onKeyDown={onEnter} required className={inputClass} />
        </Field>
        <Field label="Nomi (ru)">
          <input value={ru} onChange={(e) => setRu(e.target.value)} onKeyDown={onEnter} required className={inputClass} />
        </Field>
        <Field label="Slug (URL)" hint={preview ? `govita.uz/uz/products/${preview}` : "Boʻsh qolsa oʻzbekcha nomdan yaratiladi"}>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} onKeyDown={onEnter} placeholder={slugify(uz) || "masalan: omega-3"} className={inputClass} />
        </Field>
      </div>
    </AdminDialog>
  );
}
