"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useSession } from "@/lib/auth/store";

/*
  Shows the signed-in customer's first name once there is one.

  The name only appears after mount: the session is restored from localStorage
  on the client, and rendering it on the server would either be wrong or take
  the whole header out of static rendering. Until then the generic label
  stands, which is the same text a signed-out visitor sees — so nothing shifts
  except the wording.
*/
export function AccountLink() {
  const nav = useTranslations("nav");
  const user = useSession((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = mounted && user ? user.name.split(" ")[0] : nav("account");

  return (
    <Link href="/account" className="flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100">
      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </svg>
      <span className="max-w-[12ch] truncate">{label}</span>
    </Link>
  );
}
