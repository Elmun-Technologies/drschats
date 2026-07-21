"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";

const STAGE_ICONS = [
  "M5 13l4 4L19 7",
  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "M3 9l1-5h11l1 3h4l1 5v4h-2a2 2 0 11-4 0H9a2 2 0 11-4 0H3V9z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
];

const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

export function TrackView() {
  const t = useTranslations("track");
  const [order, setOrder] = useState<string | null>(null);

  const schema = z.object({
    order: z.string().min(3),
    phone: z.string().min(7),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    setOrder(values.order.trim().toUpperCase());
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document.getElementById("track-journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  const stages = t.raw("stages") as { title: string; text: string }[];

  return (
    <Container size="narrow" className="mt-12">
      {/* Telegram bot — primary live-tracking channel */}
      <Reveal>
        <a
          href="https://t.me/alimkhanov_pharm"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-3xl border border-[#2AABEE]/30 bg-[#2AABEE]/5 p-7 transition-colors hover:border-[#2AABEE]/60 sm:p-8"
        >
          <div className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2AABEE]/10 text-[#2AABEE]">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">{t("telegramTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("telegramText")}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f95d4]">
                {t("telegramCta")}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </a>
      </Reveal>

      {/* Lookup form */}
      <Reveal index={1}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold tracking-tight text-fg sm:text-xl">{t("lookupTitle")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted">{t("orderLabel")}</span>
              <input className={inputClass} placeholder={t("orderPlaceholder")} {...register("order")} />
              {errors.order && <span className="mt-1 block text-xs text-danger">{t("orderPlaceholder")}</span>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted">{t("phoneLabel")}</span>
              <input className={inputClass} placeholder={t("phonePlaceholder")} inputMode="tel" {...register("phone")} />
              {errors.phone && <span className="mt-1 block text-xs text-danger">{t("phonePlaceholder")}</span>}
            </label>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
            {t("lookupButton")}
          </Button>
        </form>
      </Reveal>

      {/* Order journey — illustrative timeline (never asserts real live status) */}
      {order && (
        <div id="track-journey" className="mt-6 scroll-mt-24">
          <Reveal>
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-bold tracking-tight text-fg sm:text-xl">{t("journeyTitle")}</h2>
                <span className="rounded-lg bg-surface-2 px-3 py-1 font-mono text-sm font-bold tracking-widest text-accent-strong">
                  #{order}
                </span>
              </div>

              <ol className="relative mt-8 space-y-8">
                <span className="absolute left-[22px] top-3 bottom-3 w-px bg-line" aria-hidden />
                {stages.map((stage, i) => (
                  <li key={i} className="relative flex gap-5">
                    <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-accent-strong">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={STAGE_ICONS[i]} />
                      </svg>
                    </span>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-faint">{String(i + 1).padStart(2, "0")}</span>
                        <p className="font-semibold text-fg">{stage.title}</p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{stage.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <p className="text-sm leading-relaxed text-fg">{t("journeyNote", { order })}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://t.me/alimkhanov_pharm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f95d4]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
                    </svg>
                    {t("telegramCta")}
                  </a>
                  <a
                    href="tel:+998712000000"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-strong"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" />
                    </svg>
                    {t("phoneCta")}
                  </a>
                </div>
                <p className="mt-3 text-xs text-faint">{t("callUs")}</p>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </Container>
  );
}
