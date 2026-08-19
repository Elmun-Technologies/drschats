"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export interface FilterState {
  origin?: string;
  min?: string;
  max?: string;
  sort?: string;
  q?: string;
}

export function FilterBar({
  basePath,
  origins,
  current,
}: {
  basePath: string;
  origins: string[];
  current: FilterState;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");

  const hasActive = Boolean(current.origin || current.min || current.max);

  function navigate(next: FilterState) {
    const query: Record<string, string> = {};
    if (next.sort && next.sort !== "popular") query.sort = next.sort;
    if (next.q) query.q = next.q;
    if (next.origin) query.origin = next.origin;
    if (next.min) query.min = next.min;
    if (next.max) query.max = next.max;
    router.push({ pathname: basePath, query });
  }

  function toggleOrigin(origin?: string) {
    navigate({ ...current, min, max, origin: origin === current.origin ? undefined : origin });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    navigate({ ...current, min: min || undefined, max: max || undefined });
  }

  function clearAll() {
    setMin("");
    setMax("");
    navigate({ sort: current.sort, q: current.q });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">{t("filters")}</span>
        {hasActive && (
          <button onClick={clearAll} className="text-xs text-accent hover:underline">
            {t("clearFilters")}
          </button>
        )}
      </div>

      {/* Origin */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-faint">{t("origin")}</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={!current.origin} onClick={() => toggleOrigin(undefined)}>
            {t("allOrigins")}
          </Chip>
          {origins.map((o) => (
            <Chip key={o} active={current.origin === o} onClick={() => toggleOrigin(o)}>
              {o}
            </Chip>
          ))}
        </div>
      </div>

      {/* Price */}
      <form onSubmit={applyPrice} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-faint">{t("priceFrom")}</span>
          <input
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="h-10 w-28 rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-accent"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-faint">{t("priceTo")}</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="h-10 w-28 rounded-lg border border-line bg-surface-2 px-3 text-sm outline-none focus:border-accent"
            placeholder="∞"
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-ink transition-colors hover:bg-accent-strong"
        >
          {t("apply")}
        </button>
      </form>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
