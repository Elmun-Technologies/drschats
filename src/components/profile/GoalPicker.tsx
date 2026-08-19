"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { concernOptions, signalsFromConcerns } from "@/lib/profile/concerns";
import { useProfile } from "@/lib/profile/store";
import { track } from "@/lib/analytics/events";

export function GoalPicker() {
  const t = useTranslations("profile.goals");
  const locale = useLocale() as Locale;
  const selected = useProfile((s) => s.profile.concerns);
  const setConcerns = useProfile((s) => s.setConcerns);
  const options = concernOptions(locale);

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setConcerns(next, signalsFromConcerns(next, locale));
    track("profile_goals_changed", { count: next.length });
  }

  return (
    <fieldset>
      <legend className="font-display text-lg font-bold tracking-tight">{t("title")}</legend>
      <p className="mt-1 text-sm text-muted">{t("description")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              // A chip row is a set of checkboxes, whatever it looks like. Without
              // this a screen reader announces eight unrelated buttons and never
              // says which are on.
              role="checkbox"
              aria-checked={active}
              onClick={() => toggle(option.id)}
              className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-surface text-fg hover:border-line-strong"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-3 text-xs text-faint">
        {selected.length === 0 ? t("empty") : t("chosen", { count: selected.length })}
      </p>
    </fieldset>
  );
}
