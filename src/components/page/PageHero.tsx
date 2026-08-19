import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

/** Shared page header: breadcrumb band + eyebrow + title + subtitle. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumb,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumb: string;
}) {
  const t = useTranslations("product");
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center gap-2 py-4 text-sm">
          <Link href="/" className="text-muted hover:text-accent-strong">{t("breadcrumbHome")}</Link>
          <span className="text-faint">/</span>
          <span className="font-semibold text-fg">{crumb}</span>
        </Container>
      </div>
      <Container className="pt-12">
        <div className="max-w-2xl">
          {eyebrow && (
            <Reveal>
              <p className="text-sm font-semibold text-accent-strong">{eyebrow}</p>
            </Reveal>
          )}
          <Reveal index={1}>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          </Reveal>
          {subtitle && (
            <Reveal index={2}>
              <p className="mt-4 text-lg text-muted">{subtitle}</p>
            </Reveal>
          )}
        </div>
      </Container>
    </>
  );
}
