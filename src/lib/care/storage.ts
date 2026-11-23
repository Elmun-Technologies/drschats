import { STORAGE_KEYS } from "@/lib/storage-keys";
import { parseIsoDate } from "./stages";

/*
  The tracker keeps what the visitor typed in this browser only: a due date
  and a list of children. Nothing is posted anywhere — accounts, consent and
  reminders come later (docs/ONA-BOLA.md). Storage can be missing or throw
  (private mode, embedded views), so every access is guarded.
*/

export interface CareChild {
  id: string;
  name: string;
  birth: string;
}

export interface CareStore {
  due?: string;
  children?: CareChild[];
}

const MAX_CHILDREN = 6;

export function sanitizeCare(value: unknown): CareStore {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const due = typeof v.due === "string" && parseIsoDate(v.due) ? v.due : undefined;
  const children = Array.isArray(v.children)
    ? v.children
        .filter((c): c is CareChild => {
          const x = c as Partial<CareChild> | null;
          return !!x && typeof x.id === "string" && typeof x.name === "string" && typeof x.birth === "string" && !!parseIsoDate(x.birth);
        })
        .slice(0, MAX_CHILDREN)
        .map((c) => ({ id: c.id.slice(0, 40), name: c.name.slice(0, 40), birth: c.birth }))
    : undefined;
  return { ...(due ? { due } : {}), ...(children?.length ? { children } : {}) };
}

export function readCare(): CareStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.care);
    return raw ? sanitizeCare(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function writeCare(next: CareStore): void {
  try {
    const clean = sanitizeCare(next);
    if (!clean.due && !clean.children) window.localStorage.removeItem(STORAGE_KEYS.care);
    else window.localStorage.setItem(STORAGE_KEYS.care, JSON.stringify(clean));
  } catch {
    // Storage unavailable: the tracker still works for this visit.
  }
}

export { MAX_CHILDREN };
