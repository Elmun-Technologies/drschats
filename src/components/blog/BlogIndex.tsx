import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Article } from "@/lib/content/blog";
import type { BlogCategoryKey } from "@/lib/content/blog-categories";
import { Link } from "@/lib/i18n/navigation";
import { BRAND } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";

/*
  Design: BlogV3. The blog index and each category listing are the same page:
  title, category chips (only categories that have articles), the newest
  article as a large card, the rest in a three-column grid, and the note that
  more is coming, pointing at the Telegram channel.
*/
export async function BlogIndex({
  locale,
  articles,
  categories,
  active,
  title,
  lead,
}: {
  locale: Locale;
  articles: Article[];
  categories: BlogCategoryKey[];
  active?: BlogCategoryKey;
  title: string;
  lead: string;
}) {
  const t = await getTranslations("blog");
  const tp = await getTranslations("pages.v3");
  const [featured, ...rest] = articles;

  return (
    <div className="wrap flex flex-col gap-6 pb-10 pt-3 lg:gap-8 lg:pb-20 lg:pt-6">
      <div className="flex flex-col gap-3">
        <nav aria-label={t("title")} className="hidden text-sm text-ink-2 lg:block">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-ink">{tp("nav.home")}</Link></li>
            <li aria-hidden>/</li>
            {active ? (
              <>
                <li><Link href="/blog" className="hover:text-ink">{t("title")}</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ink">{title}</li>
              </>
            ) : (
              <li aria-current="page" className="text-ink">{t("title")}</li>
            )}
          </ol>
        </nav>
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{title}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{lead}</p>
      </div>

      {categories.length > 0 && (
        <nav aria-label={t("categoriesTitle")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <Link
            href="/blog"
            aria-current={!active ? "page" : undefined}
            className={cn("inline-flex h-11 shrink-0 items-center rounded-sm px-4 text-[15px] font-medium", !active ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover")}
          >
            {t("v3.all")}
          </Link>
          {categories.map((key) => (
            <Link
              key={key}
              href={`/blog/category/${key}`}
              aria-current={key === active ? "page" : undefined}
              className={cn("inline-flex h-11 shrink-0 items-center rounded-sm px-4 text-[15px] font-medium", key === active ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover")}
            >
              {t(`categories.${key}`)}
            </Link>
          ))}
        </nav>
      )}

      {featured ? (
        <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[24px] bg-tile lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:rounded-[28px]">
          <span className="relative block aspect-[16/10] lg:aspect-auto lg:min-h-[400px]">
            <Image src={featured.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 660px" className="object-cover" />
          </span>
          <span className="flex flex-col items-start justify-center gap-3 p-5 lg:gap-4 lg:p-10">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
              <span className="inline-flex h-7 items-center rounded-pill bg-bg px-2.5 font-semibold text-ink">{t("featuredLabel")}</span>
              {featured.date && <time dateTime={featured.date}>{formatDate(featured.date, locale)}</time>}
              <span>· {t("minRead", { min: featured.readingMinutes })}</span>
            </span>
            <span className="text-2xl font-bold leading-8 group-hover:underline lg:text-[34px] lg:leading-10">{featured.title}</span>
            <span className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{featured.excerpt}</span>
            <span className={cn(buttonVariants("primary"), "mt-2")}>{t("v3.read")}</span>
          </span>
        </Link>
      ) : (
        <p className="rounded-[20px] bg-tile px-6 py-8 text-center text-base text-ink-2">{t("categoryEmpty")}</p>
      )}

      {rest.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {rest.map((a) => (
            <li key={a.slug} className="h-full">
              <ArticleTile article={a} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-5 rounded-[24px] bg-dark-panel p-6 text-white lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-9">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold leading-7 lg:text-[26px] lg:leading-8">{t("v3.soonTitle")}</h2>
          <p className="max-w-[620px] text-[15px] leading-[22px] text-on-dark-2 lg:text-base lg:leading-6">{t("v3.soonText")}</p>
        </div>
        <a
          href={BRAND.social.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants("primary", "lg"), "shrink-0 self-start bg-bg text-ink hover:bg-tile hover:text-ink focus-visible:ring-white focus-visible:ring-offset-dark-panel lg:self-center")}
        >
          {t("v3.joinTelegram")}
        </a>
      </div>
    </div>
  );
}

export async function ArticleTile({ article, locale }: { article: Article; locale: Locale }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group flex h-full flex-col gap-3">
      <span className="relative block aspect-[3/2] overflow-hidden rounded-[20px] bg-tile">
        <Image src={article.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover" />
      </span>
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex h-[26px] items-center rounded-pill bg-chip-strong px-2.5 text-[13px] font-semibold">#{article.category}</span>
        {article.date && <time dateTime={article.date} className="text-[13px] text-muted">{formatDate(article.date, locale)}</time>}
      </span>
      <span className="text-xl font-bold leading-[26px] group-hover:underline">{article.title}</span>
      <span className="text-[15px] leading-[22px] text-ink-2">{article.excerpt}</span>
    </Link>
  );
}
