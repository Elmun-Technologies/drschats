import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { QUIZ_LENGTH } from "@/lib/quiz/questions";

/** Entry point to the consultant — the widest funnel on the home page. */
export async function QuizPromo() {
  const t = await getTranslations("quiz");
  const home = await getTranslations("home.quizPromo");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-pastel-mint px-8 py-12 sm:px-14 sm:py-16">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">
                {t("eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-fg text-balance sm:text-4xl">
                {home("title")}
              </h2>
              <p className="mt-4 text-base text-fg/70">{home("subtitle")}</p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {["step1", "step2", "step3"].map((key, i) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm font-medium text-fg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/70 font-display text-xs font-bold text-accent-strong">
                      {i + 1}
                    </span>
                    {home(key)}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/quiz" className={buttonVariants("primary", "lg")}>
                  {home("cta")}
                </Link>
                <span className="text-sm text-fg/60">
                  {home("meta", { count: QUIZ_LENGTH })}
                </span>
              </div>
            </div>

            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute -bottom-10 -right-6 h-64 w-64 text-accent/10"
              fill="currentColor"
            >
              <path d="M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5z" />
            </svg>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
