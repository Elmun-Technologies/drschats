"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useT } from "@/lib/admin/i18n/client";
import { cn } from "@/lib/utils";
import { buttonClass, secondaryButtonClass, textareaClass } from "@/components/admin/ui";
import { TOOL_LABELS } from "@/lib/assistant/labels";
import type { ChatItem } from "@/lib/assistant/view";

interface Pending {
  name: string;
  preview: [string, string][];
}

interface Attachment {
  id: string;
  preview: string;
  mediaType: "image/jpeg";
  data: string;
  url?: string;
  uploading: boolean;
}

/*
  The chat on /admin/assistant. Photos are shrunk in the browser (long side
  1568 px, JPEG) before they go to the model — that is all the model can use
  and it keeps the stored history small. When the admin may edit the catalogue
  the original file is also uploaded through the product photo route, so the
  agent can put its URL on a new product.
*/
const MAX_SIDE = 1568;

async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "";
}

/* Admin paths in a reply become links; everything else stays plain text. */
function linkify(text: string): ReactNode[] {
  return text.split(/(\/admin\/[A-Za-z0-9/_%.?=&-]+)/g).map((part, i) =>
    part.startsWith("/admin/") ? (
      <Link key={i} href={part} className="font-semibold underline underline-offset-4">
        {part}
      </Link>
    ) : (
      part
    ),
  );
}

export function AssistantChat({
  initialId,
  initialItems,
  initialPending,
  canUpload,
  examples,
}: {
  initialId: number | null;
  initialItems: ChatItem[];
  initialPending: Pending | null;
  canUpload: boolean;
  examples: string[];
}) {
  const t = useT();
  const [conversationId, setConversationId] = useState(initialId);
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState(initialPending);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [items, pending, busy]);

  async function send(payload: Record<string, unknown>, optimistic?: ChatItem) {
    setBusy(true);
    setError(null);
    setNote(null);
    if (optimistic) setItems((prev) => [...prev, optimistic]);
    try {
      const res = await fetch("/admin/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, conversationId: conversationId ?? undefined }),
      });
      const data = await res.json().catch(() => ({ error: t("Javobni oʻqib boʻlmadi.") }));
      if (!res.ok || data.error) {
        setError(data.error ?? t("Xato yuz berdi."));
        if (optimistic) setItems((prev) => prev.slice(0, -1));
        return false;
      }
      setItems(data.items);
      setPending(data.pending);
      setNote(data.note);
      if (data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        window.history.replaceState(null, "", `/admin/assistant?c=${data.conversationId}`);
      }
      return true;
    } catch {
      setError(t("Tarmoq xatosi. Qayta urinib koʻring."));
      if (optimistic) setItems((prev) => prev.slice(0, -1));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    const message = text.trim();
    if (busy || (!message && attachments.length === 0) || attachments.some((a) => a.uploading)) return;
    const images = attachments.map((a) => ({ mediaType: a.mediaType, data: a.data, url: a.url }));
    const ok = await send({ message, images }, { kind: "user", text: message, images: images.length });
    if (ok) {
      setText("");
      setAttachments([]);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    for (const file of Array.from(files).slice(0, 4 - attachments.length)) {
      if (!file.type.startsWith("image/")) continue;
      const id = `${Date.now()}-${Math.random()}`;
      let data: string;
      try {
        data = await shrink(file);
      } catch {
        setError(t("Rasmni oʻqib boʻlmadi."));
        continue;
      }
      setAttachments((prev) => [...prev, { id, preview: `data:image/jpeg;base64,${data}`, mediaType: "image/jpeg", data, uploading: canUpload }]);
      if (!canUpload) continue;
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/admin/products/upload", { method: "POST", body: form }).catch(() => null);
      const json = res ? await res.json().catch(() => ({})) : {};
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, url: typeof json.url === "string" ? json.url : undefined, uploading: false } : a)));
      if (!json.url && json.error) setNote(t("Rasm saqlanmadi ({error}) — yordamchi uni koʻradi, lekin mahsulotga qoʻya olmaydi.", { error: json.error }));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-[20px] border border-line bg-bg">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 lg:p-6" aria-live="polite">
        {items.length === 0 && (
          <div className="flex flex-col gap-3 py-6">
            <p className="text-[15px] text-ink-2">{t("Nima qilish kerak? Masalan:")}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button key={ex} type="button" onClick={() => setText(ex)} className="min-h-11 rounded-[12px] bg-tile px-3.5 py-2 text-left text-[14px] text-ink hover:bg-tile-hover">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {items.map((item, i) =>
          item.kind === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-[16px] bg-ink px-4 py-3 text-[15px] leading-6 text-white">
              {item.text}
              {item.images > 0 && <span className="mt-1 block text-[13px] text-on-dark-2">{t("{n} ta rasm", { n: item.images })}</span>}
            </div>
          ) : item.kind === "assistant" ? (
            <div key={i} className="max-w-[90%] whitespace-pre-wrap rounded-[16px] bg-tile px-4 py-3 text-[15px] leading-6 text-ink">
              {linkify(item.text)}
            </div>
          ) : (
            <div key={i} className={cn("text-[13px]", item.error ? "text-red" : "text-muted")}>
              {item.error ? "⚠︎ " : "✓ "}
              {t(TOOL_LABELS[item.name] ?? item.name)}
            </div>
          ),
        )}
        {pending && (
          <div className="max-w-[90%] rounded-[16px] border-2 border-ink p-4">
            <p className="text-[15px] font-bold text-ink">{t("Tasdiqlang: {action}", { action: t(TOOL_LABELS[pending.name] ?? pending.name) })}</p>
            <dl className="mt-3 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[14px]">
              {pending.preview.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="break-words font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => send({ decision: "approve" })} className={buttonClass}>
                {t("Tasdiqlash")}
              </button>
              <button type="button" disabled={busy} onClick={() => send({ decision: "reject" })} className={secondaryButtonClass}>
                {t("Rad etish")}
              </button>
            </div>
          </div>
        )}
        {busy && <p className="text-[14px] text-muted">{t("Yordamchi ishlayapti…")}</p>}
        {note && <p className="text-[14px] text-ink-2">{note}</p>}
        {error && <p className="rounded-[12px] bg-tile px-3 py-2 text-[14px] font-semibold text-red">{error}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 border-t border-line p-3 lg:p-4">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div key={a.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- a local data: preview, not a site image */}
                <img src={a.preview} alt={t("Biriktirilgan rasm")} className={cn("h-16 w-16 rounded-[12px] object-cover", a.uploading && "opacity-50")} />
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  aria-label={t("Rasmni olib tashlash")}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[13px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || attachments.length >= 4} aria-label={t("Rasm biriktirish")} className={cn(secondaryButtonClass, "h-11 w-11 shrink-0 px-0")}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15.5 8" />
            </svg>
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSubmit();
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder={pending ? t("Yoki nimani oʻzgartirishni yozing…") : t("Yordamchiga yozing…")}
            aria-label={t("Xabar")}
            className={cn(textareaClass, "min-h-11 flex-1 resize-none")}
          />
          <button type="submit" disabled={busy || (!text.trim() && attachments.length === 0)} className={cn(buttonClass, "shrink-0")}>
            {t("Yuborish")}
          </button>
        </div>
      </form>
    </div>
  );
}
