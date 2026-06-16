import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/animation/Reveal";
import type { Article } from "@/lib/content/blog";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  const t = useTranslations("blog");
  return (
    <Reveal index={index} className="h-full">
      <Link
        href={`/blog/${article.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-line-strong"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          <div className="absolute left-4 top-4">
            <Badge tone="accent">{article.category}</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-xs text-faint">{t("minRead", { min: article.readingMinutes })}</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-fg transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
            {t("readMore")} →
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
