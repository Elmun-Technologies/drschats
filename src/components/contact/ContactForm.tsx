"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { submitContact } from "@/app/[locale]/contact/actions";

export function ContactForm() {
  const t = useTranslations("contact");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = z.object({
    name: z.string().min(2, t("errorName")),
    phone: z.string().min(7, t("errorPhone")),
    topic: z.string().optional(),
    message: z.string().min(5, t("errorMessage")),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: "order" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setServerError(null);
    const res = await submitContact(values);
    if (res.ok) {
      setSuccess(true);
      reset();
    } else {
      setServerError(res.message ?? t("errorGeneric"));
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft/40 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div>
          <p className="font-display text-xl font-semibold text-fg">{t("successTitle")}</p>
          <p className="mt-2 text-sm text-muted">{t("successText")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("nameLabel")} error={errors.name?.message}>
          <input className={inputClass} placeholder={t("namePlaceholder")} {...register("name")} />
        </Field>
        <Field label={t("phoneLabel")} error={errors.phone?.message}>
          <input className={inputClass} placeholder={t("phonePlaceholder")} inputMode="tel" {...register("phone")} />
        </Field>
      </div>

      <Field label={t("topicLabel")}>
        <select className={inputClass} {...register("topic")}>
          <option value={t("topicOrder")}>{t("topicOrder")}</option>
          <option value={t("topicConsult")}>{t("topicConsult")}</option>
          <option value={t("topicCoop")}>{t("topicCoop")}</option>
          <option value={t("topicOther")}>{t("topicOther")}</option>
        </select>
      </Field>

      <Field label={t("messageLabel")} error={errors.message?.message}>
        <textarea rows={5} className={inputClass} placeholder={t("messagePlaceholder")} {...register("message")} />
      </Field>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
