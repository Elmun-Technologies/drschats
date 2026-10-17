"use client";

import { useState } from "react";
import { saveFlow } from "@/app/admin/_actions/flows";
import { CHANNEL_LABELS, STEP_CHANNELS, formatDelay, type FlowStep, type StepChannel } from "@/lib/flows/types";
import type { Placeholder } from "@/lib/messaging/template";
import { ActionForm } from "./ActionForm";
import { TemplateInput } from "./MessageComposer";
import { Field, Pill, inputClass, smallButtonClass } from "./ui";

/*
  The flow editor: name and an ordered list of steps (delay from the trigger,
  channel, link, optional personal promo, uz + ru text with live preview and
  SMS count). The steps travel to the server action as one JSON field and are
  validated there with the same schema the engine reads (lib/flows/types.ts).
*/

type Unit = "min" | "hour" | "day";
const UNIT_MINUTES: Record<Unit, number> = { min: 1, hour: 60, day: 1440 };
const UNIT_LABEL: Record<Unit, string> = { min: "daqiqa", hour: "soat", day: "kun" };

function splitDelay(minutes: number): { amount: number; unit: Unit } {
  if (minutes > 0 && minutes % 1440 === 0) return { amount: minutes / 1440, unit: "day" };
  if (minutes > 0 && minutes % 60 === 0) return { amount: minutes / 60, unit: "hour" };
  return { amount: minutes, unit: "min" };
}

interface EditableStep extends FlowStep {
  key: number;
  unit: Unit;
}

let nextKey = 1;
function editable(step: FlowStep): EditableStep {
  return { ...step, key: nextKey++, unit: splitDelay(step.delayMinutes).unit };
}

const BLANK: FlowStep = {
  delayMinutes: 1440,
  channel: "telegram_then_sms",
  link: "/",
  promo: null,
  text: { uz: "{ism}, ", ru: "{ism}, " },
};

export function FlowEditor({
  id,
  name: initialName,
  steps: initialSteps,
  anchor,
  placeholders,
  transliterate,
}: {
  id: string;
  name: string;
  steps: FlowStep[];
  anchor: string;
  placeholders: readonly Placeholder[];
  transliterate: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [steps, setSteps] = useState<EditableStep[]>(() => (initialSteps.length ? initialSteps : [BLANK]).map(editable));

  const update = (key: number, patch: Partial<EditableStep>) => setSteps((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const remove = (key: number) => setSteps((all) => all.filter((s) => s.key !== key));
  const add = () => setSteps((all) => [...all, editable({ ...BLANK, delayMinutes: (all.at(-1)?.delayMinutes ?? 0) + 1440 })]);

  const payload = JSON.stringify(steps.map(({ key: _key, unit: _unit, ...step }) => step));

  return (
    <ActionForm action={saveFlow} submitLabel="Saqlash" className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="steps" value={payload} />
      <Field label="Nomi">
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className={inputClass} />
      </Field>

      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => {
          const amount = step.delayMinutes / UNIT_MINUTES[step.unit];
          return (
            <li key={step.key} className="rounded-[20px] bg-tile p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-ink">
                  {index + 1}-qadam <Pill tone="outline">{formatDelay(step.delayMinutes)} — {anchor}</Pill>
                  {step.promo && <Pill tone="dark">{step.promo.kind === "percent" ? `−${step.promo.value}%` : `−${step.promo.value} soʻm`} kod</Pill>}
                </p>
                {steps.length > 1 && (
                  <button type="button" onClick={() => remove(step.key)} className={smallButtonClass}>
                    Oʻchirish
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[14px] font-semibold text-ink" id={`delay-${step.key}`}>Qachon</span>
                  <div className="flex gap-2" role="group" aria-labelledby={`delay-${step.key}`}>
                    <input
                      type="number"
                      min={0}
                      aria-label="Kechikish"
                      value={Number.isFinite(amount) ? amount : 0}
                      onChange={(e) => update(step.key, { delayMinutes: Math.max(0, Math.round(Number(e.target.value) * UNIT_MINUTES[step.unit])) })}
                      className={`${inputClass} w-24`}
                    />
                    <select
                      aria-label="Birlik"
                      value={step.unit}
                      onChange={(e) => {
                        const unit = e.target.value as Unit;
                        update(step.key, { unit, delayMinutes: Math.round(amount * UNIT_MINUTES[unit]) });
                      }}
                      className={inputClass}
                    >
                      {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
                    </select>
                  </div>
                </div>
                <Field label="Kanal">
                  <select value={step.channel} onChange={(e) => update(step.key, { channel: e.target.value as StepChannel })} className={inputClass}>
                    {STEP_CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
                  </select>
                </Field>
                <Field label="Havola ({havola})" hint="Saytdagi sahifa: /cart, /sale, /products">
                  <input value={step.link} onChange={(e) => update(step.key, { link: e.target.value })} placeholder="/cart" className={inputClass} />
                </Field>
                <Field label="Shaxsiy promokod">
                  <select
                    value={step.promo ? step.promo.kind : "none"}
                    onChange={(e) => {
                      const v = e.target.value;
                      update(step.key, { promo: v === "none" ? null : { kind: v as "percent" | "fixed", value: step.promo?.value ?? (v === "percent" ? 10 : 20000), ttlHours: step.promo?.ttlHours ?? 48, minSubtotal: step.promo?.minSubtotal ?? null } });
                    }}
                    className={inputClass}
                  >
                    <option value="none">Yoʻq</option>
                    <option value="percent">Foiz chegirma</option>
                    <option value="fixed">Summa (soʻm)</option>
                  </select>
                </Field>
              </div>

              {step.promo && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label={step.promo.kind === "percent" ? "Chegirma, %" : "Chegirma, soʻm"}>
                    <input type="number" min={1} max={step.promo.kind === "percent" ? 90 : undefined} value={step.promo.value} onChange={(e) => update(step.key, { promo: { ...step.promo!, value: Math.max(1, Math.round(Number(e.target.value))) } })} className={inputClass} />
                  </Field>
                  <Field label="Amal qiladi, soat" hint="{muddat} shu muddatdan hisoblanadi">
                    <input type="number" min={1} max={2160} value={step.promo.ttlHours} onChange={(e) => update(step.key, { promo: { ...step.promo!, ttlHours: Math.max(1, Math.round(Number(e.target.value))) } })} className={inputClass} />
                  </Field>
                  <Field label="Minimal savat, soʻm" hint="Boʻsh — cheklovsiz">
                    <input type="number" min={0} value={step.promo.minSubtotal ?? ""} onChange={(e) => update(step.key, { promo: { ...step.promo!, minSubtotal: e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value))) } })} className={inputClass} />
                  </Field>
                </div>
              )}

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <TemplateInput label="Matn (oʻzbekcha)" locale="uz" value={step.text.uz} onChange={(uz) => update(step.key, { text: { ...step.text, uz } })} placeholders={placeholders} transliterate={transliterate} showSms={step.channel !== "telegram"} />
                <TemplateInput label="Matn (ruscha)" locale="ru" value={step.text.ru} onChange={(ru) => update(step.key, { text: { ...step.text, ru } })} placeholders={placeholders} transliterate={transliterate} showSms={step.channel !== "telegram"} />
              </div>
            </li>
          );
        })}
      </ol>

      {steps.length < 8 && (
        <button type="button" onClick={add} className={`${smallButtonClass} self-start`}>
          + Qadam qoʻshish
        </button>
      )}
      <p className="text-[13px] leading-5 text-muted">
        Muddat {anchor} hisoblanadi. Oʻtib ketgan qadam keyingisi ham kelgan boʻlsa yuborilmaydi — mijoz bir vaqtda bir nechta xabar olmaydi. SMS oxiriga «STOP» havolasi, Telegram xabariga «oʻchirish» tugmasi oʻzi qoʻshiladi.
      </p>
    </ActionForm>
  );
}
