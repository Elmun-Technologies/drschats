"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useSession } from "@/lib/auth/store";
import { HEADER_ITEM_CLASS, HeaderIcon, ICONS } from "./header-item";

/*
  "Kirish", or the signed-in customer's first name once the session is
  restored from localStorage after mount — so nothing shifts but the wording.
*/
export function AccountLink() {
  const t = useTranslations("header");
  const user = useSession((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = mounted && user ? user.name.split(" ")[0] : t("login");

  return (
    <Link href="/account" className={HEADER_ITEM_CLASS}>
      <HeaderIcon d={ICONS.user} />
      <span className="max-w-[10ch] truncate">{label}</span>
    </Link>
  );
}
