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

export async function AudienceDoors({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.audience");
  const [first] = getQuizQuestions(locale);
  if (!first) return null;

  return (
    <section className="py-12">
      <Container>
        <Reveal>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            {first.question}
          </h2>
          <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
        </Reveal>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {first.options.map((option, index) => (
            <Reveal key={option.id} index={Math.min(index, 6)} as="li" className="h-full">
              <Link
                href={{ pathname: "/quiz", query: { who: option.id } }}
                className="group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 bg-surface-2">
                  <Image 
                    src={IMAGES[option.id] ?? IMAGES.child} 
                    alt={option.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark gradient overlay so text is readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                </div>

                <div className="relative z-10">
                  <span className="block font-display text-xl font-bold leading-snug text-white drop-shadow-md">
                    {option.label}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white/90 transition-gap group-hover:gap-2 drop-shadow-sm">
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
