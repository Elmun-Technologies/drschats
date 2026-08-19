import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getExperts } from "@/lib/content/experts.sanity";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

const MAX_ON_HOME = 3;

/**
 * E-E-A-T on the home page: named, credentialed people stand behind the
 * catalogue. Google treats health content with an identified reviewer very
 * differently from anonymous copy — and so do customers.
 */
export async function DoctorAdvice({ locale }: { locale: Locale }) {
  const [t, common, experts] = await Promise.all([
    getTranslations("home.doctors"),
    getTranslations("common"),
    getExperts(locale),
  ]);

  const shown = experts.slice(0, MAX_ON_HOME);
  if (shown.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="mb-2 text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
          <Link href="/experts" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {shown.map((expert, i) => (
            <Reveal key={expert.slug} index={Math.min(i, 4)} as="li" className="h-full">
              <Link
                href={`/experts/${expert.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent"
              >
                <span className="relative h-16 w-16 overflow-hidden rounded-full bg-surface-2">
                  <Image src={expert.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-fg group-hover:text-accent-strong">
                  {expert.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent-strong">{expert.title}</p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{expert.bio}</p>
                {/* Credentials come from the CMS and can be absent. */}
                {expert.credentials?.length ? (
                  <p className="mt-4 border-t border-line pt-3 text-xs text-faint">
                    {expert.credentials.slice(0, 2).join(" · ")}
                  </p>
                ) : null}
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
