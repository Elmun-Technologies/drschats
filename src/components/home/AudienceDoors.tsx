import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { getQuizQuestions } from "@/lib/quiz/questions";
import type { Locale } from "@/lib/i18n/routing";

/*
  "Who are you choosing for?" as its own set of doors on the home page.

  Competitors give this its own row of categories — for men, for women, for
  children, for parents — and it is a real way people arrive. We already ask
  exactly that as the consultant's first question, so rather than invent a
  parallel taxonomy the cards *are* that question, lifted onto the home page
  and deep-linked so answering here skips the step rather than repeating it.

  Reading the options from the quiz means the two can never drift: add an
  audience there and it appears here, already translated.
*/

const IMAGES: Record<string, string> = {
  "self-woman": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
  "self-man": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
  child: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
  parent: "https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?auto=format&fit=crop&q=80&w=800",
};

const SUBTITLE_KEYS: Record<string, string> = {
  "self-woman": "subSelfWoman",
  "self-man": "subSelfMan",
  child: "subChild",
  parent: "subParent",
};

export async function AudienceDoors({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.audience");
  const [first] = getQuizQuestions(locale);
  if (!first) return null;
  const subtitleFor = (id: string) =>
    t(SUBTITLE_KEYS[id] ?? "subtitleFallback");

  return (
    <section className="py-16 sm:py-24 border-t border-line/30 bg-ink">
      <Container>
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
              {t("eyebrow")}
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">
              {first.question}
            </h2>
            <p className="mt-3 text-base text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {first.options.map((option, index) => (
            <Reveal key={option.id} index={Math.min(index, 6)} as="li" className="h-full">
              <Link
                href={{ pathname: "/quiz", query: { who: option.id } }}
                className="group relative flex h-full min-h-[340px] flex-col justify-end overflow-hidden rounded-t-[5rem] rounded-b-[1.5rem] border border-white/10 bg-brand-deep p-7 transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-deep/30"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 bg-brand-deep">
                  <Image 
                    src={IMAGES[option.id] ?? IMAGES.child} 
                    alt={option.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover opacity-85 transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Dark gradient overlay so text is readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/60 to-transparent opacity-95 transition-opacity group-hover:opacity-90" />
                </div>

                <div className="relative z-10">
                  <span className="block font-display text-2xl font-extrabold leading-snug text-white drop-shadow-md transition-colors duration-300 group-hover:text-gold">
                    {option.label}
                  </span>
                  <p className="mt-2 text-xs text-surface-2/80 line-clamp-2">
                    {subtitleFor(option.id)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gold transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                    {t("cta")}
                    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
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
  );
}
