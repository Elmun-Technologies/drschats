import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { SessionUser } from "@/lib/api/client";

interface SessionState {
  token: string | null;
  user: SessionUser | null;
  signIn: (token: string, user: SessionUser) => void;
  signOut: () => void;
  setUser: (user: SessionUser | null) => void;
}

/*
  The access token lives in localStorage rather than a cookie.

  That is a deliberate trade, not an oversight: this token authenticates a
  customer against a separate API host, and a cookie would have to be
  third-party — blocked by default in current browsers — or require the API to
  share a parent domain with the storefront, which it does not yet. The cost is
  XSS exposure, which is why the token grants exactly two things: reading your
  own orders and your own name.

  When the API moves onto a subdomain of the storefront, this should become an
  httpOnly cookie and this file should shrink to nothing.
*/
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (token, user) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
    }),
    { name: STORAGE_KEYS.session },
  ),
);
