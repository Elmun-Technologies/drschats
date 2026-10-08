"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { submitContactMessage, submitPartnerLead, type LeadResult } from "@/app/actions/leads";
import { REGION_KEYS, type RegionKey } from "@/lib/checkout/regions";
import { BRAND } from "@/lib/brand";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type Status = { phase: "idle" | "sending" } | { phase: "done"; result: LeadResult };

function Select({ id, name, defaultValue, children }: { id: string; name: string; defaultValue?: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue={defaultValue} className={cn(inputClass, "appearance-none pr-11")}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

function Outcome({ status, sent }: { status: Status; sent: string }) {
  const t = useTranslations("pages.v3.partners");
  if (status.phase !== "done") return null;
  const r = status.result;
  const text = r.ok
    ? sent
    : r.error === "invalid"
      ? t("errorInvalid")
      : r.error === "rate_limited"
        ? t("errorLimit")
        : t("errorUnavailable", { phone: BRAND.contact.phone });
  return (
    <p role={r.ok ? "status" : "alert"} className={cn("rounded-sm px-4 py-3 text-[15px]", r.ok ? "bg-tile text-ink" : "bg-red/10 font-medium text-red")}>
      {text}
    </p>
  );
}

const value = (data: FormData, key: string) => String(data.get(key) ?? "");

export function PartnerForm() {
  const t = useTranslations("pages.v3.partners");
  const tr = useTranslations("checkout.regions");
  const id = useId();
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const region = value(data, "region") as RegionKey;
    setStatus({ phase: "sending" });
    const result = await submitPartnerLead(
      {
        company: value(data, "company"),
        kind: value(data, "kind") as "pharmacy",
        contact: value(data, "contact"),
        phone: value(data, "phone"),
        region,
        branches: value(data, "branches") || undefined,
        note: value(data, "note") || undefined,
      },
      REGION_KEYS.includes(region) ? tr(region) : "",
    );
    setStatus({ phase: "done", result });
    if (result.ok) {
      track("partner_lead", { kind: value(data, "kind") });
      form.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t("company")} htmlFor={`${id}-company`}>
        <input id={`${id}-company`} name="company" required minLength={2} maxLength={160} placeholder={t("companyPh")} className={inputClass} />
      </Field>
      <Field label={t("kind")} htmlFor={`${id}-kind`}>
        <Select id={`${id}-kind`} name="kind" defaultValue="pharmacy">
          {(["pharmacy", "distribution", "corporate"] as const).map((k) => (
            <option key={k} value={k}>{t(`kinds.${k}.title`)}</option>
          ))}
        </Select>
      </Field>
      <Field label={t("contact")} htmlFor={`${id}-contact`}>
        <input id={`${id}-contact`} name="contact" required minLength={2} maxLength={120} autoComplete="name" placeholder={t("contactPh")} className={inputClass} />
      </Field>
      <Field label={t("phone")} htmlFor={`${id}-phone`}>
        <input id={`${id}-phone`} name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+998 90 123 45 67" className={inputClass} />
      </Field>
      <Field label={t("region")} htmlFor={`${id}-region`}>
        <Select id={`${id}-region`} name="region" defaultValue="tashkentCity">
          {REGION_KEYS.map((k) => (
            <option key={k} value={k}>{tr(k)}</option>
          ))}
        </Select>
      </Field>
      <Field label={t("branches")} htmlFor={`${id}-branches`}>
        <input id={`${id}-branches`} name="branches" inputMode="numeric" pattern="\d*" maxLength={10} placeholder={t("branchesPh")} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label={t("note")} htmlFor={`${id}-note`}>
          <textarea id={`${id}-note`} name="note" rows={3} maxLength={1000} placeholder={t("notePh")} className={cn(inputClass, "h-auto min-h-[96px] py-3.5")} />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={status.phase === "sending"}>{t("submit")}</Button>
          <span className="text-sm text-ink-2">{t("hint")}</span>
        </div>
        <Outcome status={status} sent={t("sent")} />
      </div>
    </form>
  );
}

export function ContactForm() {
  const t = useTranslations("pages.v3.contact");
  const id = useId();
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ phase: "sending" });
    const result = await submitContactMessage({
      name: value(data, "name"),
      phone: value(data, "phone"),
      message: value(data, "message"),
    });
    setStatus({ phase: "done", result });
    if (result.ok) {
      track("contact_message", {});
      form.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t("name")} htmlFor={`${id}-name`}>
        <input id={`${id}-name`} name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder={t("namePh")} className={inputClass} />
      </Field>
      <Field label={t("phoneField")} htmlFor={`${id}-phone`}>
        <input id={`${id}-phone`} name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+998 90 123 45 67" className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label={t("message")} htmlFor={`${id}-message`}>
          <textarea id={`${id}-message`} name="message" required minLength={5} maxLength={2000} rows={4} placeholder={t("messagePh")} className={cn(inputClass, "h-auto min-h-[110px] py-3.5")} />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <Button type="submit" disabled={status.phase === "sending"} className="self-start">{t("submit")}</Button>
        <Outcome status={status} sent={t("sent")} />
      </div>
    </form>
  );
}
