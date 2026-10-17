"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { REPO_IMAGE_KINDS, belongsTo, filterRepoImages, type RepoImage, type RepoImageKind } from "@/lib/admin/repo-images";
import { buttonClass, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { AdminDialog } from "./AdminDialog";

const PAGE = 60;

/*
  Every picture already in the repository (public/products, the cutouts,
  stock photos) as a searchable grid. "multi" adds to a list and stays open;
  "single" picks one and closes. Works without Tigris — the files ship with
  the site.
*/
export function ImagePicker({
  open,
  onClose,
  images,
  mode,
  selected,
  onPick,
  slug = "",
  title,
  initialKind,
}: {
  open: boolean;
  onClose: () => void;
  images: RepoImage[];
  mode: "multi" | "single";
  selected: string[];
  onPick: (src: string) => void;
  slug?: string;
  title: string;
  initialKind?: RepoImageKind;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RepoImageKind | undefined>(initialKind);
  const [limit, setLimit] = useState(PAGE);
  const chosen = useMemo(() => new Set(selected), [selected]);
  const hits = useMemo(() => filterRepoImages(images, { query, kind, slug }), [images, query, kind, slug]);
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: 0 };
    for (const img of filterRepoImages(images, { query })) {
      out.all += 1;
      out[img.kind] = (out[img.kind] ?? 0) + 1;
    }
    return out;
  }, [images, query]);
  const kinds: (RepoImageKind | undefined)[] = [undefined, ...(Object.keys(REPO_IMAGE_KINDS) as RepoImageKind[])];

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      wide
      title={title}
      lead={mode === "multi" ? "Bosing — rasm roʻyxatga qoʻshiladi. Bir nechtasini tanlab, «Tayyor»ni bosing." : "Bosing — rasm tanlanadi."}
      footer={
        <>
          <span className="mr-auto text-[14px] text-muted">{mode === "multi" ? `Tanlangan: ${selected.length}` : `${hits.length} ta rasm`}</span>
          <button type="button" onClick={onClose} className={buttonClass}>Tayyor</button>
        </>
      }
    >
      <div className="sticky -top-4 z-10 -mx-5 -mt-4 flex flex-col gap-3 bg-white px-5 pb-3 pt-4 sm:-mx-6 sm:px-6">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
          placeholder="Fayl nomi boʻyicha qidirish: omega, swiss, c-…"
          aria-label="Rasm qidirish"
          className={inputClass}
        />
        <div role="group" aria-label="Rasm turi" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {kinds.map((k) => (
            <button
              key={k ?? "all"}
              type="button"
              aria-pressed={kind === k}
              onClick={() => { setKind(k); setLimit(PAGE); }}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-[12px] px-4 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                kind === k ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover",
              )}
            >
              {k ? REPO_IMAGE_KINDS[k] : "Hammasi"}
              <span className={cn("text-[13px] tabular-nums", kind === k ? "text-on-dark-2" : "text-muted")}>{counts[k ?? "all"] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {hits.length === 0 ? (
        <p className="rounded-[16px] bg-tile px-4 py-8 text-center text-[14px] text-muted">Bunday nomli rasm topilmadi.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {hits.slice(0, limit).map((img) => {
              const isChosen = chosen.has(img.src);
              const own = belongsTo(img, slug);
              return (
                <li key={img.src}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(img.src);
                      if (mode === "single") onClose();
                    }}
                    disabled={mode === "multi" && isChosen}
                    aria-pressed={isChosen}
                    aria-label={`${img.name}${isChosen ? " — tanlangan" : ""}`}
                    className={cn(
                      "group flex w-full flex-col gap-1.5 rounded-[16px] p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                      isChosen ? "bg-ink" : "hover:bg-tile",
                    )}
                  >
                    <span className="relative block aspect-square w-full overflow-hidden rounded-[12px] bg-tile">
                      <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 170px, (min-width: 640px) 25vw, 45vw" className="object-contain p-2" />
                      {isChosen && <span className="absolute right-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[12px] font-semibold text-white">Tanlangan</span>}
                      {!isChosen && own && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-ink">Shu mahsulot</span>}
                    </span>
                    <span className={cn("block truncate px-1 text-[12px] leading-4", isChosen ? "text-white" : "text-ink-2")}>{img.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {hits.length > limit && (
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="inline-flex h-11 items-center rounded-[12px] bg-tile px-4 text-[14px] font-semibold text-ink hover:bg-tile-hover">
                Yana {Math.min(PAGE, hits.length - limit)} ta koʻrsatish
              </button>
            </div>
          )}
        </>
      )}
    </AdminDialog>
  );
}
