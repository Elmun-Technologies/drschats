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

const ICONS: Record<string, string> = {
  "self-woman": "M12 2a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zM12 12v9M9 18h6",
  "self-man": "M10 14a5 5 0 105-5 5 5 0 00-5 5zM14.5 9.5L20 4M20 4h-4.5M20 4v4.5",
  child: "M12 3a3 3 0 100 6 3 3 0 000-6zM7 21v-5a5 5 0 0110 0v5M9 13.5h6",
  parent: "M9 4a3 3 0 100 6 3 3 0 000-6zM4 20v-3.5A4.5 4.5 0 018.5 12M17 7a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM14 20v-3a3 3 0 013-3h1a3 3 0 013 3v3",
};

const TONES = [
  "bg-pastel-lilac",
  "bg-pastel-mint",
  "bg-pastel-sky",
  "bg-pastel-beige",
];

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
                className={`group flex h-full flex-col justify-between gap-6 rounded-2xl ${TONES[index % TONES.length]} p-6 transition-all hover:-translate-y-0.5`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fg/10 text-fg">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={ICONS[option.id] ?? ICONS.child} />
                  </svg>
                </span>
                <span>
                  <span className="block font-display text-lg font-bold leading-snug text-fg">
                    {option.label}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong transition-gap group-hover:gap-2">
                    {t("cta")}
                    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
