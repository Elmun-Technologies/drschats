import type { ReactNode } from "react";

export type IntegrationState = "connected" | "configured" | "manual" | "planned";

const STATE_LABEL: Record<IntegrationState, string> = {
  connected: "Ulangan",
  configured: "Kalit sozlangan",
  manual: "Qoʻlda boshqariladi",
  planned: "Sozlanmagan",
};

export function IntegrationStatusCard({
  name,
  category,
  description,
  state,
  detail,
  icon,
}: {
  name: string;
  category: string;
  description: string;
  state: IntegrationState;
  detail: string;
  icon: ReactNode;
}) {
  const style = state === "connected" || state === "configured"
    ? "bg-forest/5 text-forest"
    : state === "manual"
      ? "bg-[#fbf6eb] text-[#806a3e]"
      : "bg-tile text-muted";
  const dot = state === "connected" || state === "configured" ? "bg-forest" : state === "manual" ? "bg-gold" : "bg-muted/60";
  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-sm bg-tile text-forest">{icon}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[9px] font-semibold ${style}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{STATE_LABEL[state]}</span>
      </div>
      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">{category}</p>
      <h3 className="mt-1 text-[14px] font-semibold text-ink">{name}</h3>
      <p className="mt-1.5 text-[11px] leading-4 text-ink-2">{description}</p>
      <div className="mt-auto pt-4"><p className="border-t border-line pt-3 text-[10px] leading-4 text-muted">{detail}</p></div>
    </article>
  );
}
