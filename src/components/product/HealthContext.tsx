import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { TOPIC_BASE_PATH, type HealthTopic, type HealthTopicKind } from "@/lib/content/health-topics";

/*
  Where this product sits in the health layer.

  Placed high on the page, above the specification tabs, because it answers the
  question that comes before "what is in it" — whether this is the right thing
  at all. Someone who arrived from a search for magnesium may actually be
  looking for the sleep guide, and this is the only place on the page that
  offers it.
*/

const KIND_ICON: Record<HealthTopicKind, string> = {
  goal: "M12 3.5l2.6 5.4 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9z",
  symptom: "M3 12h4l2.5-6 4 12 2.5-6h5",
  vitamin: "M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5z",
};

export async function HealthContext({ topics }: { topics: HealthTopic[] }) {
  if (topics.length === 0) return null;

  const t = await getTranslations("product.healthContext");

  return (
    <section aria-labelledby="health-context" className="mt-2 rounded-[20px] border border-line p-5 lg:p-6">
      <h3 id="health-context" className="text-[17px] font-bold">{t("title")}</h3>
      <p className="mt-1 text-sm text-ink-2">{t("subtitle")}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={`${topic.kind}-${topic.slug}`}>
            <Link
              href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-tile px-4 text-[15px] font-medium transition-colors hover:bg-tile-hover"
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
      <p className="mt-4 border-t border-line pt-3 text-[13px] leading-[18px] text-muted">
        {t("disclaimer")}
      </p>
    </section>
  );
}
