import { getTranslations } from "next-intl/server";
import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/*
  /goals, /symptoms and /vitamins — the health journeys. Not in the design set,
  so drawn from its parts: the info-page header, tile cards like the "Kimga
  tanlaymiz" doors, and no stock photos — a photo per topic would mean ten
  near-identical lifestyle shots, and hot-linked ones at that.
*/
export async function TopicIndex({
  kind,
  title,
  subtitle,
  topics,
}: {
  kind: HealthTopicKind;
  eyebrow?: string;
  title: string;
  subtitle: string;
  emptyLabel?: string;
  topics: HealthTopic[];
}) {
  const health = await getTranslations("health");
  const kindLabel = health(`${kind}.plural`);

  return (
    <div className="wrap flex flex-col gap-8 pb-10 pt-4 lg:gap-10 lg:pb-20 lg:pt-8">
      <header className="flex flex-col items-start gap-3">
        <span className="text-[15px] font-semibold text-ink-2">{kindLabel}</span>
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{title}</h1>
        <p className="max-w-[760px] text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{subtitle}</p>
        <div className="mt-1 flex flex-wrap gap-2.5">
          <Link href="/quiz" className={buttonVariants("primary")}>{health("topicIndex.findAI")}</Link>
          <Link href="/products" className={buttonVariants("secondary")}>{health("topicIndex.viewProducts")}</Link>
        </div>
      </header>

      {topics.length > 0 && (
        <section aria-labelledby="topic-list" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">{health("topicIndex.directionsCount", { count: topics.length })}</span>
            <h2 id="topic-list" className="text-[22px] font-bold leading-7 lg:text-[26px]">{health("topicIndex.chooseDirection")}</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {topics.map((topic) => (
              <li key={topic.slug} className="h-full">
                <Link
                  href={`${TOPIC_BASE_PATH[kind]}/${topic.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-[20px] bg-tile p-5 transition-colors hover:bg-tile-hover lg:p-6"
                >
                  <span className="text-xl font-bold leading-7 group-hover:underline">{topic.name}</span>
                  <span className="text-[15px] leading-[22px] text-ink-2">{topic.headline}</span>
                  {topic.bullets.length > 0 && (
                    <span className="flex flex-col gap-1.5">
                      {topic.bullets.slice(0, 3).map((bullet) => (
                        <span key={bullet} className="flex items-start gap-2 text-sm leading-5 text-ink-2">
                          <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l5 5 9-10" />
                          </svg>
                          {bullet}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className={cn("mt-auto inline-flex items-center gap-1.5 pt-2 text-[15px] font-semibold")}>
                    {health("topicIndex.more")}
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclaimer variant="product" />
    </div>
  );
}
