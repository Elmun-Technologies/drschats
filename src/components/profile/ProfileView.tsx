"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { VerifyEmail } from "./VerifyEmail";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/store";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { buttonVariants } from "@/components/ui/Button";
import { AccountShell } from "@/components/account/AccountShell";
import { cn } from "@/lib/utils";

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

  /*
    The heading is rendered before hydration, in its generic form.

    The personalised title ("Sizning profilingiz, Malika") needs the stored
    name, but the page's identity does not — so the first paint carries
    t("title") and swaps to t("titleNamed") once the store has rehydrated.
    Both renders happen with `hydrated` false on the server and on the client's
    first pass, so this is an ordinary state update rather than a hydration
    mismatch.

    What it fixes: the skeleton-only first paint shipped a <main> with no
    heading in it, which is a page a screen reader user cannot orient on.
  */
  if (!hydrated) {
    return (
      <Frame>
        <h1 className={H1}>{t("title")}</h1>
        <div className="h-96 animate-pulse rounded-[20px] bg-tile" />
      </Frame>
    );
  }

  return (
    <Frame>
      <ProfileSync />
      <header className="flex flex-col gap-2">
        <h1 className={H1}>{profile.name ? t("titleNamed", { name: profile.name }) : t("title")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("subtitle")}</p>
        {!hasSignal(profile) && (
          <p className="mt-2 rounded-[16px] bg-tile px-4 py-3 text-[15px]">
            {t("quizHint")}{" "}
            <Link href="/quiz" className="font-semibold underline-offset-4 hover:underline">
              {t("quizHintCta")}
            </Link>
          </p>
        )}
      </header>

      <Card>
        <section aria-labelledby="profile-details">
          <h2 id="profile-details" className="text-xl font-bold">{t("details.title")}</h2>
          <p className="mt-1 text-[15px] text-ink-2">{t("details.description")}</p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <ProfileField
              label={t("details.name")}
              value={profile.name ?? ""}
              onChange={(name) => update({ name: name || undefined })}
              autoComplete="given-name"
            />
            <div className="flex flex-col gap-2">
              <ProfileField
                label={t("details.email")}
                type="email"
                value={profile.email ?? ""}
                onChange={(email) => update({ email: email.trim() || undefined })}
                autoComplete="email"
                hint={t("details.emailHint")}
              />
              <VerifyEmail />
            </div>
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
      </Card>

      <Card><GoalPicker /></Card>
      <Card><HouseholdEditor /></Card>
      <Card><ReminderPanel /></Card>
      <Card><ConsentPanel /></Card>
      <ProfileOffers />

      <section aria-labelledby="profile-data" className="border-t border-line pt-6">
        <h2 id="profile-data" className="text-xl font-bold">{t("data.title")}</h2>
        <p className="mt-1 text-[15px] text-ink-2">{t("data.description")}</p>
        {confirmingReset ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p role="alert" className="text-[15px] font-medium">
              {t("data.confirm")}
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setConfirmingReset(false);
              }}
              className={cn(buttonVariants("primary"), "h-11 bg-red hover:bg-red")}
            >
              {t("data.confirmYes")}
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)} className={cn(buttonVariants("secondary"), "h-11")}>
              {t("data.cancel")}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingReset(true)} className={cn(buttonVariants("secondary"), "mt-4 h-11")}>
            {t("data.clear")}
          </button>
        )}
      </section>
    </Frame>
  );
}

const H1 = "text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]";

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-[20px] border border-line p-5 lg:p-7">{children}</div>;
}

/*
  Design: ProfileV3. With a session (and an account area to go back to) the
  page sits in the cabinet layout; without one it is a page of its own — the
  profile works in this browser whether or not anybody signed in.
*/
function Frame({ children }: { children: ReactNode }) {
  const token = useSession((s) => s.token);
  if (token && accountAreaAvailable(isApiConfigured())) {
    return <AccountShell active="profile">{children}</AccountShell>;
  }
  return (
    <div className="wrap pb-9 pt-3 lg:pb-[72px] lg:pt-8">
      <div className="flex max-w-[860px] flex-col gap-4 lg:gap-5">{children}</div>
    </div>
  );
}
