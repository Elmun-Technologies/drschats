import type { VisitorEvent } from "@/lib/admin/crm";
import { EVENT_LABEL, KEY_EVENTS } from "@/lib/admin/event-labels";
import { formatDateTime } from "@/lib/admin/order-labels";
import { EmptyState, som } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

function eventDetail(e: VisitorEvent): string {
  if (e.type === "search") return `«${String(e.meta?.term ?? "")}»`;
  if (e.type === "purchase") return `${String(e.meta?.order ?? "")}${e.value ? ` · ${som(e.value)}` : ""}`;
  if (e.productName || e.productSlug) return `${e.productName ?? e.productSlug}${e.value ? ` · ${som(e.value)}` : ""}`;
  if (e.type === "begin_checkout" && e.value) return som(e.value);
  return e.path ?? "";
}

/** Events grouped into visits (sessions), newest first. */
export function Timeline({ events }: { events: VisitorEvent[] }) {
  if (events.length === 0) return <EmptyState title="Harakatlar hali yozilmagan" />;
  const sessions: { id: string; events: VisitorEvent[] }[] = [];
  for (const event of events) {
    const last = sessions[sessions.length - 1];
    if (last && (last.id === event.sessionId || event.sessionId === "server")) last.events.push(event);
    else sessions.push({ id: event.sessionId, events: [event] });
  }
  return (
    <ol className="flex flex-col gap-5">
      {sessions.map((session, index) => {
        const start = session.events[session.events.length - 1].createdAt;
        return (
          <li key={`${session.id}-${index}`}>
            <p className="mb-2 text-[13px] font-semibold text-muted">Tashrif · {formatDateTime(start)} · {session.events.length} ta harakat</p>
            <ol className="relative flex flex-col gap-2 border-l border-line pl-5">
              {session.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn("absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white", KEY_EVENTS.has(e.type) ? "bg-ink" : "bg-line-strong")} />
                  <p className={cn("text-[14px] leading-5", KEY_EVENTS.has(e.type) ? "font-semibold text-ink" : "text-ink-2")}>
                    {EVENT_LABEL[e.type]}
                    {eventDetail(e) && <span className="font-normal text-muted"> — {eventDetail(e)}</span>}
                  </p>
                  <p className="text-[12px] text-muted">{new Intl.DateTimeFormat("ru-RU", { timeStyle: "short", timeZone: "Asia/Tashkent" }).format(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

