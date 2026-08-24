import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { TOPIC_BASE_PATH, type HealthTopic, type HealthTopicKind } from "@/lib/content/health-topics";

/*
  Where this product sits in the health layer.

  Placed high on the page, above the specification tabs, because it answers the
  question that comes before "what is in it" — whether this is the right thing
  at all. Someone who arrived from a search for magnesium may actually be
  looking for the sleep guide, and this is the only place on the page that
  offers it.
*/
const KIND_STYLE: Record<HealthTopicKind, string> = {
  goal: "bg-accent-soft text-accent-strong hover:bg-accent hover:text-brand-deep",
  symptom: "bg-signal-soft text-signal hover:bg-signal hover:text-white",
  vitamin: "bg-surface-2 text-fg hover:bg-fg hover:text-ink",
};

const KIND_ICON: Record<HealthTopicKind, string> = {
  goal: "M12 3.5l2.6 5.4 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9z",
  symptom: "M3 12h4l2.5-6 4 12 2.5-6h5",
  vitamin: "M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5z",
};

export async function HealthContext({ topics }: { topics: HealthTopic[] }) {
  if (topics.length === 0) return null;

  const t = await getTranslations("product.healthContext");

  return (
    <Reveal as="section" aria-labelledby="health-context" className="mt-12 rounded-2xl border border-line bg-surface p-6 sm:p-7">
      <h2 id="health-context" className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <ul className="mt-5 flex flex-wrap gap-2.5">
        {topics.map((topic) => (
          <li key={`${topic.kind}-${topic.slug}`}>
            <Link
              href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${KIND_STYLE[topic.kind]}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={KIND_ICON[topic.kind]} />
              </svg>
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Uzbek advertising law: health content on a commercial page has to say
          plainly that it does not replace a doctor. */}
      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-faint">
        {t("disclaimer")}
      </p>
    </Reveal>
  );
}
