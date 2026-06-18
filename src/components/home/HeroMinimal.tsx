import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

/** Swiss-style full-bleed hero: one calm photographic banner, overlaid headline
 *  and a single action. */
export function HeroMinimal() {
  const t = useTranslations("home.hero");
  return (
    <section className="relative flex min-h-[78svh] items-center overflow-hidden border-b border-line pt-16">
      <div className="absolute inset-0 -z-10">
        <Image src="/placeholders/p4.svg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
      </div>

      <Container>
        <div className="max-w-2xl py-20">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
            <span className="h-px w-8 bg-accent" />
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-fg text-balance sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">{t("subtitle")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/products" className={buttonVariants("primary", "lg")}>
              {t("cta")}
            </Link>
            <Link href="/about" className={buttonVariants("secondary", "lg")}>
              {t("secondaryCta")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
