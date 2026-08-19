import Image from "next/image";
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
          <div className="relative overflow-hidden rounded-3xl bg-pastel-mint shadow-sm">
            <div className="flex flex-col lg:flex-row">
              <div className="relative z-10 p-8 sm:p-14 lg:w-7/12 lg:py-16">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">
                  {t("eyebrow")}
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-fg text-balance sm:text-4xl">
                  {home("title")}
                </h2>
                <p className="mt-4 text-base text-fg/70 max-w-xl">{home("subtitle")}</p>

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
                  <span className="text-sm font-medium text-fg/60">
                    {home("meta", { count: QUIZ_LENGTH })}
                  </span>
                </div>
              </div>

              <div className="relative min-h-[300px] lg:w-5/12">
                <Image 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
                  alt="Medical Consultation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                {/* Gradient mask to blend image edge */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-pastel-mint to-transparent hidden lg:block" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
