"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useProfile } from "@/lib/profile/store";
import type { Relation } from "@/lib/profile/types";
import { ageOn } from "@/lib/profile/types";
import { ProfileField } from "./ProfileField";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/events";

const RELATIONS: Relation[] = ["child", "partner", "parent", "other"];

/*
  Who else the shopping is for.

  This is the single most useful thing a customer can tell a vitamin shop:
  "for my child" changes the dose, the format and the entire tone of what we
  should show them, and it is the fact behind every reminder that is worth
  sending — a birthday, the weeks before the school year, a course running out.

  A birth date is optional here. A parent who gives only a name still gets the
  reminders that do not need an age.
*/
export function HouseholdEditor() {
  const t = useTranslations("profile.household");
  const household = useProfile((s) => s.profile.household);
  const addMember = useProfile((s) => s.addMember);
  const updateMember = useProfile((s) => s.updateMember);
  const removeMember = useProfile((s) => s.removeMember);

  const [relation, setRelation] = useState<Relation>("child");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");

  const today = new Date();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addMember({
      relation,
      name: name.trim() || undefined,
      birthday: birthday || undefined,
    });
    track("profile_member_added", { relation });
    setName("");
    setBirthday("");
  }

  return (
    <section aria-labelledby="profile-household">
      <h2 id="profile-household" className="font-display text-lg font-bold tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("description")}</p>

      {household.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {household.map((member) => {
            const age = ageOn(member.birthday, today);
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                  {t(`relation.${member.relation}`)}
                </span>
                <span className="font-semibold text-fg">{member.name || t("unnamed")}</span>
                {age !== null && <span className="text-sm text-muted">{t("age", { age })}</span>}

                <label className="ml-auto flex items-center gap-2 text-sm text-muted">
                  <span className="sr-only sm:not-sr-only">{t("birthday")}</span>
                  <input
                    type="date"
                    value={member.birthday && member.birthday.length === 10 ? member.birthday : ""}
                    max={today.toISOString().slice(0, 10)}
                    aria-label={t("birthdayFor", { name: member.name || t("unnamed") })}
                    onChange={(e) => updateMember(member.id, { birthday: e.target.value || undefined })}
                    className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  aria-label={t("removeFor", { name: member.name || t("unnamed") })}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-faint transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <fieldset>
          <legend className="text-sm font-semibold text-fg">{t("addTitle")}</legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {RELATIONS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={relation === value}
                onClick={() => setRelation(value)}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  relation === value
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line bg-ink text-fg hover:border-line-strong"
                }`}
              >
                {t(`relation.${value}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProfileField label={t("name")} value={name} onChange={setName} autoComplete="off" />
            <ProfileField
              label={t("birthday")}
              type="date"
              value={birthday}
              onChange={setBirthday}
              max={today.toISOString().slice(0, 10)}
              hint={t("birthdayHint")}
            />
          </div>

          <Button type="submit" variant="secondary" className="mt-4">
            {t("add")}
          </Button>
        </fieldset>
      </form>
    </section>
  );
}
