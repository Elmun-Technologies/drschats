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
        className="group relative flex h-[400px] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-brand-deep transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-deep/20"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col justify-end p-6">
          <div className="mb-4">
            <Badge tone="accent" className="bg-gold/20 text-gold backdrop-blur-md border-none">{article.category}</Badge>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{t("minRead", { min: article.readingMinutes })}</p>
          <h3 className="font-display text-2xl font-bold leading-snug text-white transition-colors group-hover:text-gold drop-shadow-md">
            {article.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm font-medium text-white/80 drop-shadow-sm">{article.excerpt}</p>
        </div>
      </Link>
    </Reveal>
  );
}
