import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export function HomeCTA() {
  const t = useTranslations("home.cta");
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-blue/10" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 border-t border-b border-line" />

      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent-soft px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-strong">
              {t("eyebrow")}
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-balance sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t("subtitle")}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/products" className={buttonVariants("primary", "lg")}>
                {t("button")}
              </Link>
              <Link href="/experts" className={buttonVariants("secondary", "lg")}>
                {t("secondaryButton")}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
