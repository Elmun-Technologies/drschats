import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { COMMERCE } from "@/lib/config/commerce";
import type { Locale } from "@/lib/i18n/routing";
import { chipClass } from "@/components/ui/Chip";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";

/*
  What the shop is, in words, and the door into the health-goal guides —
  the site is built around goals, and the home page had no link to them.
  The goal row follows the same rule as the menu: no published goal, no row.
*/
export async function HomeIntro({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.v3.intro");
  const goals = await getHealthTopics(locale, "goal").catch(() => []);
  return (
    <section aria-labelledby="home-title" className="wrap flex flex-col gap-4 lg:gap-5">
      <div className="flex max-w-[820px] flex-col gap-1.5 lg:gap-2">
        <h1 id="home-title" className="text-[22px] font-bold leading-7 lg:text-[28px] lg:leading-[34px]">
          {t("title")}
        </h1>
        <p className="text-[15px] leading-[22px] text-ink-2 lg:text-base lg:leading-6">
          {t("lead", { hours: String(COMMERCE.delivery.tashkent.hours) })}
        </p>
      </div>
      {goals.length > 0 && (
        <nav aria-label={t("goals")} className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <span className="shrink-0 text-sm font-semibold text-muted lg:text-[15px]">{t("goals")}</span>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
            {goals.slice(0, 6).map((g) => (
              <Link key={g.slug} href={`${TOPIC_BASE_PATH.goal}/${g.slug}`} className={chipClass()}>
                {g.name}
              </Link>
            ))}
            <Link href={TOPIC_BASE_PATH.goal} className={cn(chipClass(), "font-semibold")}>
              {t("goalsAll")}
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </nav>
      )}
    </section>
  );
}
