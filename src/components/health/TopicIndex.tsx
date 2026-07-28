import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Disclaimer } from "@/components/legal/Disclaimer";

export function TopicIndex({
  kind,
  eyebrow,
  title,
  subtitle,
  emptyLabel,
  topics,
}: {
  kind: HealthTopicKind;
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyLabel: string;
  topics: HealthTopic[];
}) {
  return (
    <div className="pt-10 pb-6">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-muted">{subtitle}</p>
        </header>

        {topics.length === 0 ? (
          <p className="py-24 text-center text-muted">{emptyLabel}</p>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <Reveal key={topic.slug} index={Math.min(i, 6)} as="li" className="h-full">
                <Link
                  href={`${TOPIC_BASE_PATH[kind]}/${topic.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-ink p-6 transition-all hover:-translate-y-0.5 hover:border-accent"
                >
                  <h2 className="font-display text-lg font-bold text-fg group-hover:text-accent-strong">
                    {topic.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-accent-strong">{topic.headline}</p>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{topic.intro}</p>
                  {topic.bullets.length > 0 && (
                    <p className="mt-4 border-t border-line pt-3 text-xs text-faint">
                      {topic.bullets.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </ul>
        )}

        <div className="mt-16">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
