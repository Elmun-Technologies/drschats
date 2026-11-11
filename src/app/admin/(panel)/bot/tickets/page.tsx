import Link from "next/link";
import { ActionForm } from "@/components/admin/ActionForm";
import { BotTabs } from "@/components/admin/BotTabs";
import { Card, PageHeader, Pill, secondaryButtonClass, textareaClass } from "@/components/admin/ui";
import { closeTicketAction, replyTicket } from "@/app/admin/_actions/bot";
import { formatDateTime } from "@/lib/admin/order-labels";
import { listTickets } from "@/lib/bot/store";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Murojaatlar");

const CATEGORY = { operator: "Savol", consult: "Maslahat", return: "Qaytarish", "club-conflict": "Raqam ziddiyati" } as const;
const STATUS = { open: "Ochiq", answered: "Javob berilgan", closed: "Yopilgan" } as const;

export default async function BotTicketsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  await requireAdmin();
  const all = (await searchParams).all === "1";
  const rows = await listTickets(all ? "all" : "open");

  return (
    <>
      <PageHeader title={t("Murojaatlar")} lead={t("Mijozlar botga yozgan xabarlar. Javob shu botdan boradi.")} />
      <BotTabs active="/admin/bot/tickets" />
      <nav aria-label={t("Filtr")} className="mb-4 flex gap-2">
        {[
          { href: "/admin/bot/tickets", label: t("Ochiq"), on: !all },
          { href: "/admin/bot/tickets?all=1", label: t("Hammasi"), on: all },
        ].map((f) => (
          <Link key={f.href} href={f.href} aria-current={f.on ? "page" : undefined} className={cn("flex h-11 items-center rounded-sm px-4 text-[15px]", f.on ? "bg-ink font-semibold text-white" : "bg-bg text-ink-2")}>
            {f.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <Card><p className="text-[15px] text-ink-2">{t("Murojaat yoʻq.")}</p></Card>
      ) : (
        <ul className="grid gap-4">
          {rows.map(({ t: tk, phone, name, username }) => (
            <li key={tk.id}>
              <Card>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  <span className="font-semibold text-ink">#{tk.id}</span>
                  <Pill>{CATEGORY[tk.category]}</Pill>
                  <Pill tone={tk.status === "open" ? "dark" : "neutral"}>{STATUS[tk.status]}</Pill>
                  <span>{formatDateTime(tk.createdAt)}</span>
                  <span>· {name || "Nomaʼlum"}{phone ? ` · +${phone}` : " · raqam bogʻlanmagan"}{username ? ` · @${username}` : ""}</span>
                </div>
                <p className="whitespace-pre-wrap text-[15px] leading-6">{tk.text}</p>
                {tk.reply && (
                  <p className="mt-3 whitespace-pre-wrap rounded-sm bg-tile px-4 py-3 text-[15px] leading-6 text-ink-2">
                    <span className="font-semibold text-ink">{t("Javob:")} </span>{tk.reply}
                  </p>
                )}
                {tk.status !== "closed" && (
                  <div className="mt-4 grid gap-3">
                    {!tk.reply && (
                      <ActionForm action={replyTicket} submitLabel={t("Javob yuborish")} className="grid gap-3">
                        <input type="hidden" name="id" value={tk.id} />
                        <label className="sr-only" htmlFor={`reply-${tk.id}`}>{t("Javob #")}{tk.id}</label>
                        <textarea id={`reply-${tk.id}`} name="reply" required maxLength={3000} className={textareaClass} />
                      </ActionForm>
                    )}
                    <form action={closeTicketAction}>
                      <input type="hidden" name="id" value={tk.id} />
                      <button type="submit" className={secondaryButtonClass}>{t("Yopish")}</button>
                    </form>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
