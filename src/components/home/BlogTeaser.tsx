import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getArticles } from "@/lib/content/blog.sanity";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { buttonVariants } from "@/components/ui/Button";

export async function BlogTeaser({ locale }: { locale: Locale }) {
  const [t, articles] = await Promise.all([getTranslations("blog"), getArticles(locale)]);
  if (articles.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="mb-2 text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{t("title")}</h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
          <Link href="/blog" className={buttonVariants("secondary")}>
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
