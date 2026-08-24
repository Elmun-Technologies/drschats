import { getTranslations } from "next-intl/server";
import type { HealthTopic, HealthTopicKind } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Disclaimer } from "@/components/legal/Disclaimer";
import Image from "next/image";

const TOPIC_IMAGES = [
  "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&q=80&w=600",
];

const getImageForSlug = (slug: string) => {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TOPIC_IMAGES[hash % TOPIC_IMAGES.length];
};

export async function TopicIndex({
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
  const nav = await getTranslations("nav");
  const health = await getTranslations("health");

  const heroImage = kind === "goal"
    ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1400"
    : kind === "symptom"
      ? "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1400"
      : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ad?auto=format&fit=crop&q=80&w=1400";

  const kindLabel =
    kind === "goal"
      ? health("goal.plural")
      : kind === "symptom"
        ? health("symptom.plural")
        : health("vitamin.plural");

  return (
    <div className="min-h-screen">
      {/* Full-width Hero Section */}
      <section className="relative h-[50vh] min-h-[420px] overflow-hidden bg-brand-deep">
        <Image
          src={heroImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/80 to-transparent" />

        <Container className="absolute inset-0 flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold border border-gold/30 mb-4">
              {kindLabel}
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              {title}
            </h1>
            <p className="mt-4 text-lg text-surface-2/90 max-w-xl">{subtitle}</p>

            {topics.length === 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-brand-deep transition-all hover:bg-white hover:scale-105"
                >
                  {health("topicIndex.takeQuiz")}
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
                >
                  {health("topicIndex.viewProducts")}
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Topics Grid */}
      {topics.length > 0 && (
        <section className="py-16 sm:py-20 bg-ink border-t border-line/30">
          <Container>
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-ink">
                  {health("topicIndex.directionsCount", { count: topics.length })}
                </span>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-brand-deep">
                  {health("topicIndex.chooseDirection")}
                </h2>
              </div>
              <Link
                href="/quiz"
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-brand-deep transition-all hover:bg-white hover:scale-105"
              >
                {health("topicIndex.findAI")}
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, i) => (
                <Reveal key={topic.slug} index={Math.min(i, 6)} as="li" className="h-full">
                  <Link
                    href={`${TOPIC_BASE_PATH[kind]}/${topic.slug}`}
                    className="group relative flex h-[420px] flex-col justify-end overflow-hidden rounded-[2.25rem] border border-white/10 bg-brand-deep transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-deep/30"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={getImageForSlug(topic.slug)}
                        alt={topic.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-85 transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-transparent opacity-95" />
                    </div>

                    <div className="relative z-10 p-7 flex flex-col justify-end h-full">
                      <h2 className="font-display text-2xl font-extrabold text-white transition-colors group-hover:text-gold drop-shadow-md">
                        {topic.name}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-surface-2/90 drop-shadow-sm">{topic.headline}</p>
                      {topic.bullets.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {topic.bullets.slice(0, 3).map((bullet, idx) => (
                            <span key={idx} className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white/80">
                              {bullet}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gold opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                        {health("topicIndex.more")}
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <Container className="py-12">
        <Disclaimer variant="product" />
      </Container>
    </div>
  );
}
