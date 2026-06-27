import type { MetadataRoute } from "next";
import { locales, routing } from "@/lib/i18n/routing";
import { shopflow, listAllSlugs } from "@/lib/shopflow";
import { listArticleSlugs } from "@/lib/content/blog";
import { listExpertSlugs } from "@/lib/content/experts";
import { SITE_URL } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await shopflow.getCategories(routing.defaultLocale);

  const staticPaths = ["", "/products", "/about", "/blog", "/contact", "/experts", "/delivery", "/loyalty"];
  const categoryPaths = categories.map((c) => `/products/${c.slug}`);
  const productPaths = listAllSlugs().map(({ slug }) => `/product/${slug}`);
  const blogPaths = listArticleSlugs().map((slug) => `/blog/${slug}`);
  const expertPaths = listExpertSlugs().map((slug) => `/experts/${slug}`);
  const allPaths = [...staticPaths, ...categoryPaths, ...productPaths, ...blogPaths, ...expertPaths];

  return allPaths.map((path) => {
    const languages: Record<string, string> = {};
    for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
    return {
      url: `${SITE_URL}/${routing.defaultLocale}${path}`,
      lastModified: new Date(),
      changeFrequency: path.startsWith("/product/") ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/product/") ? 0.8 : 0.6,
      alternates: { languages },
    };
  });
}
