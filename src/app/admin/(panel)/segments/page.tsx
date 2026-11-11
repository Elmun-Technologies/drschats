import Link from "next/link";
import { SEGMENTS, segmentCounts } from "@/lib/admin/segments";
import { PageHeader, Pill, SectionTitle, som } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Segmentlar va retarget");

export default async function AdminSegmentsPage() {
  await requireAdmin();
  const counts = await segmentCounts();
  const groups = [
    { kind: "customers" as const, title: t("Mijozlar (telefoni maʼlum)"), lead: t("Eksport qilib Meta / Google auditoriyasiga yuklang yoki Telegram orqali xabar yuboring.") },
    { kind: "bot" as const, title: t("Bot aʼzolari (Telegram)"), lead: t("Botni ishga tushirganlar. Telefon hali bogʻlanmagan boʻlsa ham ularga bot orqali yozish mumkin — sayt segmentlaridan farqi shu.") },
    { kind: "visitors" as const, title: t("Tashrif buyuruvchilar (anonim)"), lead: t("Pixel orqali remarketing auditoriyasi; telefoni maʼlum boʻlganlarga toʻgʻridan-toʻgʻri murojaat.") },
  ];
  return (
    <>
      <PageHeader title={t("Segmentlar va retarget")} lead={t("Avtomatik yangilanadigan auditoriyalar: kim qaysi bosqichda qolib ketdi, kim qancha vaqtdan beri sotib olmadi. Har birini bir bosishda eksport qilish yoki xabar yuborish mumkin.")} />
      {groups.map((group) => (
        <section key={group.kind}>
          <SectionTitle>{group.title}</SectionTitle>
          <p className="-mt-1 mb-3 text-[14px] text-muted">{group.lead}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SEGMENTS.filter((s) => s.kind === group.kind).map((segment) => {
              const c = counts[segment.id];
              return (
                <Link key={segment.id} href={`/admin/segments/${segment.id}`} className="flex flex-col rounded-[20px] bg-tile p-5 transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[17px] font-bold leading-6 text-ink">{t(segment.title)}</h3>
                    <span className="text-[26px] font-bold leading-8 tabular-nums text-ink">{formatNumber(c.size)}</span>
                  </div>
                  <p className="mt-1.5 flex-1 text-[14px] leading-5 text-ink-2">{t(segment.description)}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Pill tone={c.reachable > 0 ? "dark" : "outline"}>
                      {segment.kind === "visitors" ? `Telefoni bor: ${formatNumber(c.reachable)}` : `Telegram: ${formatNumber(c.reachable)}`}
                    </Pill>
                    {c.value > 0 && (
                      <Pill tone="outline">
                        {segment.kind === "customers" ? "LTV" : segment.kind === "bot" ? (segment.id === "bot-cart" ? "Savatda" : "Xarid") : "Savatlarda"} {som(c.value)}
                      </Pill>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] font-semibold text-ink">→ {segment.action}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
