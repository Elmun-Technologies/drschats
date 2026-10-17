"use client";

import { useId, useRef } from "react";
import { countSms, prepareSmsText } from "@/lib/sms/segments";
import {
  PLACEHOLDERS,
  PLACEHOLDER_LABELS,
  SAMPLE_STOP_URL,
  finalizeText,
  sampleVars,
  withOptOut,
  type MessageLocale,
  type Placeholder,
} from "@/lib/messaging/template";
import { cn } from "@/lib/utils";
import { textareaClass } from "./ui";

/*
  A message template editor: textarea, placeholder chips that insert at the
  cursor, and a live preview with sample values and the SMS part count —
  including the STOP line the sender appends. Used by the flow editor and the
  segment campaign form, so both count SMS the same way the sender does.
*/

export function SmsMeter({ text, transliterate = false, className }: { text: string; transliterate?: boolean; className?: string }) {
  const c = countSms(prepareSmsText(text, { transliterate }));
  const heavy = c.parts > 3;
  return (
    <p className={cn("text-[13px] tabular-nums", heavy ? "font-semibold text-ink" : "text-muted", className)} aria-live="polite">
      SMS: {c.parts} qism · {c.length} belgi · {c.encoding === "GSM-7" ? "lotin (GSM-7, 160/153)" : "Unicode (UCS-2, 70/67)"}
      {heavy && " — juda uzun, qisqartiring"}
    </p>
  );
}

export function TemplateInput({
  label,
  name,
  value,
  onChange,
  locale,
  placeholders = PLACEHOLDERS,
  showSms = true,
  transliterate = false,
  rows = 4,
  maxLength = 1000,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  locale: MessageLocale;
  placeholders?: readonly Placeholder[];
  showSms?: boolean;
  transliterate?: boolean;
  rows?: number;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  function insert(key: Placeholder) {
    const el = ref.current;
    const token = `{${key}}`;
    if (!el) return onChange(`${value}${token}`);
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  const preview = finalizeText(value, sampleVars(locale));
  const smsText = withOptOut(preview, "sms", SAMPLE_STOP_URL, locale);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold text-ink">{label}</label>
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className={textareaClass}
      />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Oʻzgaruvchi qoʻshish">
        {placeholders.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => insert(key)}
            title={PLACEHOLDER_LABELS[key]}
            className="inline-flex min-h-11 items-center rounded-[12px] bg-tile px-3 font-mono text-[13px] font-semibold text-ink transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            {`{${key}}`}
          </button>
        ))}
      </div>
      <div className="rounded-[12px] border border-line bg-white px-3.5 py-3">
        <p className="text-[13px] font-semibold text-muted">Koʻrinishi (namuna qiymatlar bilan)</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-5 text-ink">{preview || "—"}</p>
        {showSms && <SmsMeter text={smsText} transliterate={transliterate} className="mt-2" />}
      </div>
    </div>
  );
}
