"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { findOrder } from "@/app/actions/trackOrder";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-[12px] border border-line-strong bg-bg px-4 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

export function TrackForm() {
  const t = useTranslations("track");
  const router = useRouter();
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const result = await findOrder({ number: String(data.get("number") ?? ""), phone: String(data.get("phone") ?? "") }).catch(
      () => ({ ok: false, error: "unavailable" }) as const,
    );
    if (result.ok) {
      router.push(`/track/${result.token}`);
      return;
    }
    setPending(false);
    setError(
      result.error === "invalid"
        ? t("invalid")
        : result.error === "rate_limited"
          ? t("limited")
          : result.error === "not_found"
            ? t("notFound", { phone: BRAND.contact.phone })
            : t("unavailable", { phone: BRAND.contact.phone }),
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-[20px] border border-line p-5 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${id}-number`} className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">{t("number")}</span>
          <input id={`${id}-number`} name="number" required autoComplete="off" autoCapitalize="characters" placeholder={t("numberPh")} className={inputClass} />
        </label>
        <label htmlFor={`${id}-phone`} className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">{t("phone")}</span>
          <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder={t("phonePh")} className={inputClass} />
        </label>
      </div>
      <p className="text-sm leading-5 text-muted">{t("whereNumber")}</p>
      {error && (
        <p role="alert" className={cn("rounded-[12px] bg-red/10 px-4 py-3 text-[15px] font-medium text-red")}>
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {t("submit")}
      </Button>
    </form>
  );
}
