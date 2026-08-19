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

        {/* These sections are linked from the main nav, so an empty one is a
            landing page, not a dead end — it offers the two routes that answer
            the same question the section would have. */}
        {topics.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-line bg-surface px-6 py-16 text-center">
            <p className="text-muted">{emptyLabel}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/quiz"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-accent-strong"
              >
                {nav("quiz")}
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-line bg-ink px-5 py-2.5 text-sm font-bold text-fg transition-colors hover:border-accent hover:text-accent-strong"
              >
                {nav("products")}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <Reveal key={topic.slug} index={Math.min(i, 6)} as="li" className="h-full">
                <Link
                  href={`${TOPIC_BASE_PATH[kind]}/${topic.slug}`}
                  className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-brand-deep transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-deep/20"
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={getImageForSlug(topic.slug)}
                      alt={topic.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-brand-deep/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                    <h2 className="font-display text-2xl font-bold text-white transition-colors group-hover:text-gold drop-shadow-md">
                      {topic.name}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-white/90 drop-shadow-sm">{topic.headline}</p>
                    <p className="mt-3 line-clamp-2 text-sm text-white/70">{topic.intro}</p>
                    {topic.bullets.length > 0 && (
                      <p className="mt-5 border-t border-white/20 pt-4 text-[11px] uppercase tracking-widest font-bold text-white/50">
                        {topic.bullets.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
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
