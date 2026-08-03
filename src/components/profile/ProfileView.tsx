"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { useProfile } from "@/lib/profile/store";
import { hasSignal } from "@/lib/profile/types";
import { ProfileField } from "./ProfileField";
import { GoalPicker } from "./GoalPicker";
import { HouseholdEditor } from "./HouseholdEditor";
import { ReminderPanel } from "./ReminderPanel";
import { ConsentPanel } from "./ConsentPanel";
import { ProfileOffers } from "./ProfileOffers";
import { ProfileSync } from "./ProfileSync";

/*
  /profile — everything the visitor has told us, in one editable place.

  Deliberately not behind the account API. The shop's personalisation runs on
  data that lives in this browser, so the page that shows and edits that data
  has to work in the same browser, signed in or not. When the accounts API is
  configured the profile is additionally synced to it; when it is not, nothing
  here stops working.
*/
export function ProfileView() {
  const t = useTranslations("profile");
  const profile = useProfile((s) => s.profile);
  const update = useProfile((s) => s.update);
  const reset = useProfile((s) => s.reset);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // The store rehydrates from localStorage after mount; rendering the default
  // empty profile first would flash "nothing saved" at a returning visitor.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-surface" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <ProfileSync />
      <header className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {profile.name ? t("titleNamed", { name: profile.name }) : t("title")}
        </h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
        {!hasSignal(profile) && (
          <p className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft/40 px-4 py-3 text-sm text-fg">
            {t("quizHint")}{" "}
            <Link href="/quiz" className="font-semibold text-accent-strong underline-offset-4 hover:underline">
              {t("quizHintCta")}
            </Link>
          </p>
        )}
      </header>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-12">
        <section aria-labelledby="profile-details">
          <h2 id="profile-details" className="font-display text-lg font-bold tracking-tight">
            {t("details.title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("details.description")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ProfileField
              label={t("details.name")}
              value={profile.name ?? ""}
              onChange={(name) => update({ name: name || undefined })}
              autoComplete="given-name"
            />
            <ProfileField
              label={t("details.email")}
              type="email"
              value={profile.email ?? ""}
              onChange={(email) => update({ email: email.trim() || undefined })}
              autoComplete="email"
              hint={t("details.emailHint")}
            />
            <ProfileField
              label={t("details.birthday")}
              type="date"
              value={profile.birthday ?? ""}
              onChange={(birthday) => update({ birthday: birthday || undefined })}
              max={new Date().toISOString().slice(0, 10)}
              hint={t("details.birthdayHint")}
            />
          </div>
        </section>

        <GoalPicker />
        <HouseholdEditor />
        <ReminderPanel />
        <ConsentPanel />
        <ProfileOffers />

        <section aria-labelledby="profile-data" className="border-t border-line pt-8">
          <h2 id="profile-data" className="font-display text-lg font-bold tracking-tight">
            {t("data.title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("data.description")}</p>
          {confirmingReset ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p role="alert" className="text-sm font-medium text-fg">
                {t("data.confirm")}
              </p>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setConfirmingReset(false);
                }}
                className="min-h-11 rounded-full bg-danger px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("data.confirmYes")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("data.cancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="mt-4 min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-muted transition-colors hover:border-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("data.clear")}
            </button>
          )}
        </section>
      </div>
    </Container>
  );
}
