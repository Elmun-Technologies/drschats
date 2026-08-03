"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { api, isApiConfigured, type StoredProfile } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { useProfile } from "@/lib/profile/store";
import { emptyProfile, type HealthProfile, type Relation } from "@/lib/profile/types";

const DEBOUNCE_MS = 1500;
const RELATIONS: Relation[] = ["child", "partner", "parent", "other"];

/**
 * Keeps the browser's profile and the account's copy in step, when there is an
 * account to keep it with.
 *
 * Pulls once per sign-in, then pushes on every edit. The pull is what makes the
 * profile follow someone to a second device; the push is what keeps the
 * marketing queue reading the birthdays and the consent the customer actually
 * set. Local stays the source of truth for what personalises this session — a
 * page that reads the profile must not wait on a network call — so the pull
 * only fills a profile that has never been edited here.
 *
 * Entirely optional. Without the API, without a session, or on a failure,
 * nothing here is missed: the page it sits on works without it.
 */
export function ProfileSync() {
  const locale = useLocale() as Locale;
  const token = useSession((s) => s.token);
  const profile = useProfile((s) => s.profile);
  const markSynced = useProfile((s) => s.markSynced);
  const hydrate = useProfile((s) => s.hydrate);
  const inFlight = useRef(false);
  const pulledFor = useRef<string | null>(null);

  // Pull: only for a profile this browser has never edited, so a sign-in
  // cannot silently overwrite something typed a minute ago.
  useEffect(() => {
    if (!isApiConfigured() || !token) return;
    if (profile.updatedAt !== 0) return;
    if (pulledFor.current === token) return;
    pulledFor.current = token;

    const controller = new AbortController();
    api
      .myProfile(token, controller.signal)
      .then((stored) => hydrate(fromApi(stored)))
      .catch(() => {
        // No account copy yet, or the API is unreachable — the local profile
        // stands, and the next edit will push it.
      });

    return () => controller.abort();
  }, [token, profile.updatedAt, hydrate]);

  // Push, debounced because the profile page saves on every keystroke.
  useEffect(() => {
    if (!isApiConfigured() || !token) return;
    if (profile.updatedAt === 0) return;
    if (profile.syncedAt && profile.syncedAt >= profile.updatedAt) return;

    const timer = setTimeout(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await api.saveProfile(token, {
          email: profile.email,
          birthday: profile.birthday,
          locale,
          goals: profile.goals,
          household: profile.household.map(({ relation, name, birthday }) => ({
            relation,
            name,
            birthday,
          })),
          marketingEmail: profile.consents.email,
          marketingTelegram: profile.consents.telegram,
        });
        markSynced();
      } catch {
        // Left unsynced, so the next edit tries again.
      } finally {
        inFlight.current = false;
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [token, profile, locale, markSynced]);

  return null;
}

function isRelation(value: string): value is Relation {
  return (RELATIONS as string[]).includes(value);
}

/** The account's shape, in the browser's terms. */
function fromApi(stored: StoredProfile): HealthProfile {
  return {
    ...emptyProfile(),
    email: stored.email || undefined,
    birthday: stored.birthday || undefined,
    goals: stored.goals ?? [],
    household: (stored.household ?? []).map((member) => ({
      id: `m${member.id}`,
      // An unknown relation is kept rather than dropped: losing a household
      // member because the server learned a new word would be worse.
      relation: isRelation(member.relation) ? member.relation : "other",
      name: member.name || undefined,
      birthday: member.birthday || undefined,
    })),
    consents: { email: stored.marketingEmail, telegram: stored.marketingTelegram },
    consentUpdatedAt: stored.marketingEmail || stored.marketingTelegram ? Date.now() : undefined,
    updatedAt: 0,
  };
}
