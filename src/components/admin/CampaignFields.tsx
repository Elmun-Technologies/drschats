"use client";

import { useState } from "react";
import type { CampaignChannel } from "@/lib/db/schema";
import { TemplateInput } from "./MessageComposer";
import { Field, inputClass } from "./ui";

/*
  The variable half of the segment campaign form: channel, text with
  placeholders and SMS count, link and an optional personal code per
  recipient. Field names match sendSegmentCampaign's schema.
*/

const CHANNELS: { value: CampaignChannel; label: string; hint: string }[] = [
  { value: "telegram", label: "Telegram", hint: "faqat botga ulanganlar" },
  { value: "telegram_then_sms", label: "Telegram, boʻlmasa SMS", hint: "eng keng qamrov" },
  { value: "sms", label: "SMS", hint: "telefoni maʼlum mijozlar" },
];

export function CampaignFields({
  defaultMessage,
  defaultLink,
  reach,
  channels = ["telegram", "telegram_then_sms", "sms"],
}: {
  defaultMessage: string;
  defaultLink: string;
  reach: { telegram: number; phones: number };
  /** A bot audience has no phone for everyone, so it offers Telegram only. */
  channels?: CampaignChannel[];
}) {
  const [channel, setChannel] = useState<CampaignChannel>(channels[0] ?? "telegram");
  const [message, setMessage] = useState(defaultMessage);
  const [promo, setPromo] = useState<"none" | "percent" | "fixed">("none");

  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[14px] font-semibold text-ink">Kanal</legend>
        {CHANNELS.filter((c) => channels.includes(c.value)).map((c) => (
          <label key={c.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-transparent bg-tile px-3.5 text-[14px] text-ink has-[:checked]:border-ink has-[:checked]:bg-white">
            <input type="radio" name="channel" value={c.value} checked={channel === c.value} onChange={() => setChannel(c.value)} className="h-5 w-5 accent-ink" />
            <span className="font-semibold">{c.label}</span>
            <span className="ml-auto text-right text-[13px] text-muted">
              {c.value === "telegram" ? `${reach.telegram} ta` : `${reach.phones} ta`} · {c.value === "telegram" && channels.length === 1 ? "bot aʼzolari" : c.hint}
            </span>
          </label>
        ))}
      </fieldset>

      <TemplateInput label="Xabar" name="message" locale="uz" value={message} onChange={setMessage} placeholders={["ism", "kod", "muddat", "havola"]} showSms={channel !== "telegram"} rows={5} />

      <Field label="Havola ({havola})" hint="Saytdagi sahifa, masalan /sale. Bosishlar va buyurtmalar kampaniyaga yoziladi.">
        <input name="link" defaultValue={defaultLink} placeholder="/sale" maxLength={200} className={inputClass} />
      </Field>

      <Field label="Har bir mijozga shaxsiy promokod">
        <select name="promoKind" value={promo} onChange={(e) => setPromo(e.target.value as typeof promo)} className={inputClass}>
          <option value="none">Yoʻq</option>
          <option value="percent">Foiz chegirma</option>
          <option value="fixed">Summa (soʻm)</option>
        </select>
      </Field>
      {promo !== "none" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={promo === "percent" ? "Chegirma, %" : "Chegirma, soʻm"}>
            <input name="promoValue" type="number" min={1} max={promo === "percent" ? 90 : undefined} defaultValue={promo === "percent" ? 10 : 20000} className={inputClass} />
          </Field>
          <Field label="Muddat, soat">
            <input name="promoTtl" type="number" min={1} max={2160} defaultValue={72} className={inputClass} />
          </Field>
          <Field label="Min. savat, soʻm">
            <input name="promoMin" type="number" min={0} placeholder="—" className={inputClass} />
          </Field>
        </div>
      )}
    </>
  );
}
