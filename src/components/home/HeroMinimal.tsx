import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

/** Clean, minimal Swiss-style hero: generous whitespace, one clear message,
 *  one primary action, a single calm product visual. */
export function HeroMinimal() {
  const t = useTranslations("home.hero");
  return (
    <section className="border-b border-line pt-16">
      <Container>
        <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
                <span className="h-px w-8 bg-accent" />
                {t("eyebrow")}
              </span>
            </Reveal>
            <Reveal index={1}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-fg text-balance sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 max-w-md text-lg text-muted">{t("subtitle")}</p>
            </Reveal>
            <Reveal index={3}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/products" className={buttonVariants("primary", "lg")}>
                  {t("cta")}
                </Link>
                <Link href="/about" className={buttonVariants("ghost", "lg")}>
                  {t("secondaryCta")} →
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal index={2}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-line bg-surface">
              <Image src="/placeholders/p3.svg" alt="" fill priority sizes="(max-width:1024px) 90vw, 460px" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
