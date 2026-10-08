import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";
import { getQuizQuestions } from "@/lib/quiz/questions";
import type { Locale } from "@/lib/i18n/routing";

/*
  "Who are you choosing for?" as its own row of doors on the home page.

  The doors *are* the consultant's first question, deep-linked so answering here
  skips the step rather than repeating it. Reading the options from the quiz
  means the two can never drift: add an audience there and it appears here
  already translated.

  The photographs in `/public/images/audience` are AI-generated placeholders,
  made in one session and one style so the row does not look assembled from
  different sites: warm daylight, milky-beige ground, a plain unlabelled bottle,
  no white coats and no hospital. They are also deliberately not our products —
  a generated label would be a made-up package on a page about what we sell.

  They exist to hold the layout until the Tashkent shoot happens; that shoot
  replaces these six files and nothing else has to change. The shoot list, the
  rules (one lens, one light, model consent, image rights to the company) and
  the file names are in docs/GOVITA-TAVSIYALAR.md §1.
*/

const PHOTOS: Record<string, string> = {
  "self-woman": "/images/audience/woman.jpg",
  "self-man": "/images/audience/man.jpg",
  expectant: "/images/audience/pregnancy.jpg",
  child: "/images/audience/child.jpg",
  parent: "/images/audience/senior.jpg",
  recovery: "/images/audience/recovery.jpg",
};

const SUBTITLE_KEYS: Record<string, string> = {
  "self-woman": "subSelfWoman",
  "self-man": "subSelfMan",
  expectant: "subExpectant",
  child: "subChild",
  parent: "subSenior",
  recovery: "subIllness",
};

const ICONS: Record<string, string> = {
  "self-woman": "M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2.5-7 6v2h14v-2c0-3.5-3-6-7-6z",
  "self-man": "M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2.5-7 6v2h14v-2c0-3.5-3-6-7-6z",
  expectant: "M12 3a3 3 0 110 6 3 3 0 010-6zm-1.5 8h3A4.5 4.5 0 0118 15.5c0 2.5-2 4.5-4.5 4.5h-3A4.5 4.5 0 016 15.5 4.5 4.5 0 0110.5 11z",
  child: "M9 4a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zm-2 8a5 5 0 1110 0v3a5 5 0 01-10 0v-3zm3 8h4v4H10v-4z",
  parent: "M12 11a4 4 0 100-8 4 4 0 000 8zm-7 11c0-4 3-6.5 7-6.5s7 2.5 7 6.5v1H5v-1z",
  recovery: "M12 21s-7-4.3-7-9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 3.5C19 16.7 12 21 12 21z",
};

export async function AudienceDoors({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.audience");
  const audience = getQuizQuestions(locale).find((q) => q.id === "who");
  if (!audience) return null;

  return (
    <Section tone="ink" aria-labelledby="audience-heading">
      <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-legacy-muted">{t("eyebrow")}</p>
        <Reveal>
          <h2
            id="audience-heading"
            className="font-display text-2xl font-extrabold tracking-tight text-balance text-fg sm:text-3xl lg:text-4xl"
          >
            {audience.question}
          </h2>
        </Reveal>
        <p className="mt-3 text-pretty text-base text-legacy-muted sm:text-lg">{t("subtitle")}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {audience.options.map((option, index) => (
          <Reveal key={option.id} index={Math.min(index, 6)} as="li" className="h-full">
            <Link
              href={{ pathname: "/quiz", query: { who: option.id } }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-legacy-line bg-surface transition-colors duration-300 hover:border-legacy-line-strong"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
                <Image
                  src={PHOTOS[option.id] ?? PHOTOS["self-woman"]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-legacy-ink/85 text-signal backdrop-blur-sm">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={ICONS[option.id] ?? ICONS["self-woman"]} />
                  </svg>
                </span>
              </span>

              <span className="flex flex-1 flex-col gap-2 p-6">
                <span className="font-display text-xl font-extrabold leading-snug text-brand-deep">
                  {option.label}
                </span>
                <span className="text-sm text-legacy-muted">{t(SUBTITLE_KEYS[option.id] ?? "subtitleFallback")}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-extrabold uppercase tracking-widest text-legacy-muted transition-colors group-hover:text-fg">
                  {t("cta")}
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
