"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { api, isApiConfigured } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { useProfile } from "@/lib/profile/store";

const DEBOUNCE_MS = 1500;

/**
 * Mirrors the browser's profile to the accounts API, when there is one.
 *
 * Deliberately one-way and best-effort. The browser stays the source of truth
 * for what personalises this session — the copy on the server exists so the
 * same goals and the same household follow the customer to another device, and
 * so the marketing queue has birthdays to read. If the API is not configured,
 * or the customer is not signed in, or the request fails, nothing here is
 * missed: the page it sits on works entirely without it.
 *
 * Debounced because the profile page saves on every keystroke.
 */
export function ProfileSync() {
  const locale = useLocale() as Locale;
  const token = useSession((s) => s.token);
  const profile = useProfile((s) => s.profile);
  const markSynced = useProfile((s) => s.markSynced);
  const inFlight = useRef(false);

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
