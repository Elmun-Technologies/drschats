"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { useProfile } from "@/lib/profile/store";
import { parseBirthday } from "@/lib/profile/types";
import { optInBirthday, optOutBirthday } from "@/app/actions/loyalty";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Choice";
import { ProfileField } from "./ProfileField";

/*
  The one place the browser-only profile sends something to the server, and
  only on an explicit tick: name, the birthday's day and month (the year only
  if the visitor gave one) and a phone, for a greeting with a personal code
  (lib/birthday, the "birthday" flow). Withdrawing deletes the row. Which
  phone was sent is remembered in this browser, so the page can offer to
  withdraw it.
*/

const SENT_KEY = "govita-birthday-optin";

function readSent(): string | null {
  try {
    return localStorage.getItem(SENT_KEY);
  } catch {
    return null;
  }
}

function writeSent(phone: string | null) {
  try {
    if (phone) localStorage.setItem(SENT_KEY, phone);
    else localStorage.removeItem(SENT_KEY);
  } catch {
    /* a lost reminder of what was sent is harmless */
  }
}

export function BirthdayGift() {
  const t = useTranslations("profile.birthdayGift");
  const locale = useLocale() as Locale;
  const profile = useProfile((s) => s.profile);
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const saved = readSent();
    if (saved) {
      setSent(saved);
      setPhone(saved);
      setConsent(true);
    }
  }, []);

  const save = async () => {
    const birthday = parseBirthday(profile.birthday);
    if (!birthday) return setMessage({ tone: "error", text: t("needDate") });
    if (phone.replace(/\D/g, "").length < 9) return setMessage({ tone: "error", text: t("needPhone") });
    if (!consent) return setMessage({ tone: "error", text: t("needConsent") });
    setPending(true);
    const res = await optInBirthday({
      phone,
      name: profile.name,
      day: birthday.day,
      month: birthday.month,
      year: birthday.year ?? null,
      locale,
      consent: true,
    }).catch(() => ({ ok: false as const, error: "failed" as const }));
    setPending(false);
    if (res.ok) {
      writeSent(phone);
      setSent(phone);
      setMessage({ tone: "ok", text: t("saved") });
    } else setMessage({ tone: "error", text: t("failed") });
  };

  const remove = async () => {
    if (!sent) return;
    setPending(true);
    const res = await optOutBirthday({ phone: sent }).catch(() => ({ ok: false as const, error: "failed" as const }));
    setPending(false);
    if (res.ok) {
      writeSent(null);
      setSent(null);
      setConsent(false);
      setMessage({ tone: "ok", text: t("removed") });
    } else setMessage({ tone: "error", text: t("failed") });
  };

  return (
    <section aria-labelledby="profile-birthday-gift" className="flex flex-col gap-3">
      <div>
        <h2 id="profile-birthday-gift" className="text-xl font-bold">{t("title")}</h2>
        <p className="mt-1 text-[15px] text-ink-2">{t("description")}</p>
      </div>
      <div className="max-w-[360px]">
        <ProfileField label={t("phone")} value={phone} onChange={setPhone} autoComplete="tel" placeholder="+998 90 123 45 67" />
      </div>
      <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} className="items-start">
        {t("consent")}
      </Checkbox>
      <p className="text-[13px] leading-[18px] text-muted">{t("explain")}</p>
      <div className="flex flex-wrap gap-2.5">
        <Button type="button" variant="primary" className="h-11" onClick={save} disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        {sent && (
          <Button type="button" variant="secondary" className="h-11" onClick={remove} disabled={pending}>
            {t("remove")}
          </Button>
        )}
      </div>
      <p aria-live="polite" className={message ? (message.tone === "error" ? "text-sm font-medium text-red" : "text-sm font-medium text-ink") : "sr-only"}>
        {message?.text ?? ""}
      </p>
    </section>
  );
}
