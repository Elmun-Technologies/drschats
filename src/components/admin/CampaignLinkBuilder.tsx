"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";

const CHANNELS = [
  { source: "google", medium: "cpc", label: "Google Ads" },
  { source: "yandex", medium: "cpc", label: "Yandex Direct" },
  { source: "instagram", medium: "social", label: "Instagram" },
  { source: "facebook", medium: "social", label: "Facebook" },
  { source: "telegram", medium: "messenger", label: "Telegram" },
  { source: "email", medium: "email", label: "Email" },
] as const;

const LANDINGS = [
  { value: "/uz", label: "Bosh sahifa" },
  { value: "/uz/products", label: "Mahsulotlar" },
  { value: "/uz/sale", label: "Aksiyalar" },
  { value: "/ru", label: "Bosh sahifa (rus)" },
  { value: "/uz/quiz", label: "Maslahat testi" },
  { value: "/uz/blog", label: "Blog" },
];

export function CampaignLinkBuilder({ baseUrl }: { baseUrl: string }) {
  const [channel, setChannel] = useState<string>("google");
  const [landing, setLanding] = useState("/uz");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copyState, setCopyState] = useState("");
  const selected = CHANNELS.find((item) => item.source === channel) ?? CHANNELS[0];

  const url = useMemo(() => {
    if (!campaign.trim()) return "";
    try {
      const result = new URL(landing, baseUrl);
      result.searchParams.set("utm_source", selected.source);
      result.searchParams.set("utm_medium", selected.medium);
      result.searchParams.set("utm_campaign", campaign.trim().toLowerCase().replace(/\s+/g, "-"));
      if (content.trim()) result.searchParams.set("utm_content", content.trim());
      if (term.trim()) result.searchParams.set("utm_term", term.trim());
      return result.toString();
    } catch {
      return "";
    }
  }, [baseUrl, campaign, content, landing, selected, term]);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("Havola nusxalandi");
    } catch {
      setCopyState("Havolani belgilang va nusxalang");
    }
    window.setTimeout(() => setCopyState(""), 2500);
  }

  return (
    <section className="rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <div className="mb-5"><h2 className="text-[18px] font-bold leading-6 text-ink">UTM havola yaratish</h2><p className="mt-1 text-[13px] leading-4 text-muted">Reklama havolalari buyurtmaga birinchi va soʻnggi trafik manbasini biriktirishga yordam beradi.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Reklama kanali">
          <select value={channel} onChange={(event) => setChannel(event.target.value)} className={inputClass}>
            {CHANNELS.map((item) => <option key={item.source} value={item.source}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Landing sahifa">
          <select value={landing} onChange={(event) => setLanding(event.target.value)} className={inputClass}>
            {LANDINGS.map((page) => <option key={page.value} value={page.value}>{page.label}</option>)}
          </select>
        </Field>
        <Field label="Kampaniya nomi" hint="Masalan: kuzgi chegirma">
          <input value={campaign} onChange={(event) => setCampaign(event.target.value)} placeholder="autumn-sale-2026" maxLength={100} className={inputClass} />
        </Field>
        <Field label="Eʼlon / kreativ (ixtiyoriy)">
          <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="video-01" maxLength={100} className={inputClass} />
        </Field>
        <Field label="Kalit soʻz (ixtiyoriy)" className="sm:col-span-2">
          <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="omega-3" maxLength={100} className={inputClass} />
        </Field>
      </div>
      {url ? (
        <div className="mt-5 rounded-sm bg-tile p-4">
          <p className="text-[12px] font-semibold text-muted">Tayyor havola</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <output className="min-w-0 flex-1 break-all rounded-sm border border-line bg-white px-3 py-2.5 font-mono text-[12px] leading-4 text-ink-2">{url}</output>
            <button type="button" onClick={copyLink} className="inline-flex h-12 shrink-0 items-center justify-center rounded-sm bg-ink px-5 text-[15px] font-semibold text-white hover:bg-black">Nusxalash</button>
          </div>
          <p aria-live="polite" className="mt-2 min-h-4 text-[12px] text-ink">{copyState}</p>
        </div>
      ) : (
        <p className="mt-4 rounded-sm bg-tile p-3 text-[12px] leading-4 text-muted">Havolani tuzish uchun kampaniya nomini kiriting.</p>
      )}
    </section>
  );
}
