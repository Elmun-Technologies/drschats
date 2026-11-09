"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useSession } from "@/lib/auth/store";
import { HEADER_ITEM_CLASS, HeaderIcon, ICONS } from "./header-item";
import { SESSION_EVENT } from "@/lib/config/telegram-login";

/*
  "Kirish", or the signed-in customer's first name once the session is
  restored from localStorage after mount — so nothing shifts but the wording.
*/
/** The Telegram cabinet's display cookie (lib/customer/current.ts NAME_COOKIE) — never trusted. */
function signedInName(): string | null {
  try {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("gv_cn="))?.slice(6);
    if (!raw) return null;
    const name = decodeURIComponent(raw).trim();
    return name === "✓" ? null : name.slice(0, 20) || null;
  } catch {
    return null;
  }
}

export function AccountLink() {
  const t = useTranslations("header");
  const user = useSession((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [telegramName, setTelegramName] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
    setTelegramName(signedInName());
    // Sign-in and sign-out happen without a reload (TelegramLogin, CabinetActions).
    const sync = () => setTelegramName(signedInName());
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);

  const label = mounted && user ? user.name.split(" ")[0] : mounted && telegramName ? telegramName : t("login");

  return (
    <Link href="/account" className={HEADER_ITEM_CLASS}>
      <HeaderIcon d={ICONS.user} />
      <span className="max-w-[10ch] truncate">{label}</span>
    </Link>
  );
}
