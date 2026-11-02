"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cancelTrackedOrder } from "@/app/[locale]/track/[token]/actions";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";

/*
  Self-cancel on the tracking page: one button, then an inline «are you
  sure» (no dialog). Shown only while the order is new or confirmed and not
  paid online — the page decides that; the server checks it again with the
  order row locked.
*/
export function CancelOrder({ token }: { token: string }) {
  const t = useTranslations("track.cancel");
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "sending">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function cancel() {
    setStep("sending");
    const { result } = await cancelTrackedOrder(token).catch(() => ({ result: "unavailable" as const }));
    if (result === "cancelled") {
      router.refresh();
      return;
    }
    setStep("idle");
    setMessage(t(result === "paid" ? "paid" : result === "too_late" ? "tooLate" : "failed", { phone: BRAND.contact.phone }));
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] border border-line p-5 lg:p-6">
      <span className="text-base font-semibold">{t("title")}</span>
      <span className="text-[15px] leading-[22px] text-ink-2">{t("hint")}</span>
      {step === "idle" ? (
        <Button type="button" variant="secondary" className="self-start" onClick={() => setStep("confirm")}>
          {t("cta")}
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="w-full text-[15px] font-semibold">{t("confirm")}</span>
          <Button type="button" onClick={cancel} disabled={step === "sending"}>
            {step === "sending" ? t("sending") : t("yes")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep("idle")} disabled={step === "sending"}>
            {t("no")}
          </Button>
        </div>
      )}
      {message && (
        <p role="alert" className="text-sm font-medium text-red">
          {message}
        </p>
      )}
    </div>
  );
}
