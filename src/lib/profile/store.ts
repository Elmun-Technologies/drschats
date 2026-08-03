import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { ChannelConsent, HealthProfile, HouseholdMember } from "./types";
import { emptyProfile } from "./types";

interface ProfileState {
  profile: HealthProfile;
  /** Patch scalar fields. Anything omitted is left alone. */
  update: (patch: Partial<Omit<HealthProfile, "v" | "household" | "consents">>) => void;
  addMember: (member: Omit<HouseholdMember, "id">) => void;
  updateMember: (id: string, patch: Partial<Omit<HouseholdMember, "id">>) => void;
  removeMember: (id: string) => void;
  setConsent: (patch: Partial<ChannelConsent>) => void;
  /** Replace the picked concerns and the signals derived from them. */
  setConcerns: (ids: string[], signals: { topics: string[]; ingredients: string[] }) => void;
  /** Merge quiz output in without discarding goals the visitor set by hand. */
  applyQuiz: (topics: string[], ingredients: string[]) => void;
  markSynced: () => void;
  /** Erase everything volunteered. Behavioural history is untouched. */
  reset: () => void;
}

function newId(): string {
  // Only has to be unique within one household list, so a timestamp plus a
  // short random tail is plenty and avoids pulling in a uuid dependency.
  return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const MAX_GOALS = 8;
const MAX_MEMBERS = 8;

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: emptyProfile(),

      update: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch, updatedAt: Date.now() } })),

      addMember: (member) =>
        set((state) => {
          if (state.profile.household.length >= MAX_MEMBERS) return state;
          return {
            profile: {
              ...state.profile,
              household: [...state.profile.household, { ...member, id: newId() }],
              updatedAt: Date.now(),
            },
          };
        }),

      updateMember: (id, patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            household: state.profile.household.map((m) =>
              m.id === id ? { ...m, ...patch } : m,
            ),
            updatedAt: Date.now(),
          },
        })),

      removeMember: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            household: state.profile.household.filter((m) => m.id !== id),
            updatedAt: Date.now(),
          },
        })),

      setConsent: (patch) =>
        set((state) => {
          const now = Date.now();
          return {
            profile: {
              ...state.profile,
              consents: { ...state.profile.consents, ...patch },
              // Stamped on every decision, including a withdrawal: proving when
              // someone opted *out* matters more than proving when they opted in.
              consentUpdatedAt: now,
              updatedAt: now,
            },
          };
        }),

      setConcerns: (ids, signals) =>
        set((state) => ({
          profile: {
            ...state.profile,
            concerns: ids,
            goals: signals.topics.slice(0, MAX_GOALS),
            focusIngredients: signals.ingredients.slice(0, MAX_GOALS),
            updatedAt: Date.now(),
          },
        })),

      applyQuiz: (topics, ingredients) =>
        set((state) => {
          const goals = [...state.profile.goals];
          for (const slug of topics) {
            if (!goals.includes(slug) && goals.length < MAX_GOALS) goals.push(slug);
          }
          return {
            profile: {
              ...state.profile,
              goals,
              focusIngredients: ingredients.slice(0, MAX_GOALS),
              updatedAt: Date.now(),
            },
          };
        }),

      markSynced: () =>
        set((state) => ({ profile: { ...state.profile, syncedAt: Date.now() } })),

      reset: () => set({ profile: emptyProfile() }),
    }),
    {
      name: STORAGE_KEYS.profile,
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
