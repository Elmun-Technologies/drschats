import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { chipClass } from "@/components/ui/Chip";
import { TOPIC_BASE_PATH, type HealthTopic } from "@/lib/content/health-topics";

/*
  Where this product sits in the health layer: the goal, symptom and vitamin
  pages it belongs to. Someone who arrived from a search for magnesium may
  actually be looking for the sleep guide, and this is the only place on the
  page that offers it.
*/
export async function HealthContext({ topics }: { topics: HealthTopic[] }) {
  if (topics.length === 0) return null;

  const t = await getTranslations("product");

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[15px] font-bold">{t("v3.topics")}</span>
      <ul className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={`${topic.kind}-${topic.slug}`}>
            <Link href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`} className={chipClass()}>
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
      {/* Uzbek advertising law: health content on a commercial page has to say
          plainly that it does not replace a doctor. */}
      <p className="text-[13px] leading-[18px] text-muted">{t("healthContext.disclaimer")}</p>
    </div>
  );
}
