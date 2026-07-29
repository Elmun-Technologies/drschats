import type { MetadataRoute } from "next";
import { locales, routing } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { listArticleSlugs } from "@/lib/content/blog.sanity";
import { listExpertSlugs } from "@/lib/content/experts.sanity";
import { getHealthTopicIndex } from "@/lib/content/health-topics.sanity";
import { getProgramSlugs } from "@/lib/content/programs.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { SITE_URL } from "@/lib/seo/metadata";
import type { Product } from "@/lib/shopflow/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, allProducts] = await Promise.all([
    shopflow.getCategories(routing.defaultLocale).catch(() => []),
    shopflow.getProducts({ locale: routing.defaultLocale, sort: "popular", pageSize: 200 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200 })),
  ]);

  // Build a rating map for priority boosting
  const ratingMap = new Map<string, number>(
    allProducts.items.map((p: Product) => [p.slug, p.rating]),
  );

  const staticPaths = [
    "", "/products", "/about", "/blog", "/contact", "/experts", "/delivery",
    "/loyalty", "/ingredients", "/brands", "/news", "/payment", "/guarantee",
    "/requisites", "/licenses", "/goals", "/symptoms", "/vitamins", "/quiz", "/programs",
    "/reviews",
  ];
  const categoryPaths = categories.map((c) => `/products/${c.slug}`);
  const [blogSlugs, expertSlugs, healthTopics, programSlugs] = await Promise.all([
    listArticleSlugs(),
    listExpertSlugs(),
    getHealthTopicIndex(),
    getProgramSlugs(),
  ]);
  const productPaths = allProducts.items.map((p) => `/product/${p.slug}`);
  const blogPaths = blogSlugs.map((slug) => `/blog/${slug}`);
  const expertPaths = expertSlugs.map((slug) => `/experts/${slug}`);
  const topicPaths = healthTopics.map((t) => `${TOPIC_BASE_PATH[t.kind]}/${t.slug}`);
  const programPaths = programSlugs.map((slug) => `/programs/${slug}`);
  const allPaths = [...staticPaths, ...categoryPaths, ...productPaths, ...blogPaths, ...expertPaths, ...topicPaths, ...programPaths];

  return allPaths.map((path) => {
    const languages: Record<string, string> = {};
    for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;

    let priority = path === "" ? 1 : 0.6;
    if (path.startsWith("/product/")) {
      const slug = path.replace("/product/", "");
      const rating = ratingMap.get(slug) ?? 0;
      // High-rated (≥4.5) products get priority 0.9, others 0.8
      priority = rating >= 4.5 ? 0.9 : 0.8;
    } else if (path.startsWith("/products/") || path === "/products") {
      priority = 0.7;
    } else if (path.startsWith("/blog/")) {
      priority = 0.65;
    } else if (["/goals", "/symptoms", "/vitamins", "/programs"].some((p) => path.startsWith(p))) {
      // Health topics are the organic-search backbone — rank them above the
      // static informational pages, just under product detail.
      priority = path.split("/").length > 2 ? 0.8 : 0.75;
    }

    languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

    let changeFrequency: "weekly" | "monthly" | "daily" = "monthly";
    if (path.startsWith("/product/")) changeFrequency = "weekly";
    else if (path.startsWith("/blog/")) changeFrequency = "weekly";
    else if (path === "/products" || path === "" || path.startsWith("/products/")) changeFrequency = "daily";

    return {
      url: `${SITE_URL}/${routing.defaultLocale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: { languages },
    };
  });
}
