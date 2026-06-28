import type { MetadataRoute } from "next";
import { locales, routing } from "@/lib/i18n/routing";
import { shopflow, listAllSlugs } from "@/lib/shopflow";
import { listArticleSlugs } from "@/lib/content/blog.sanity";
import { listExpertSlugs } from "@/lib/content/experts.sanity";
import { SITE_URL } from "@/lib/seo/metadata";
import type { Product } from "@/lib/shopflow/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, allProducts] = await Promise.all([
    shopflow.getCategories(routing.defaultLocale),
    shopflow.getProducts({ locale: routing.defaultLocale, sort: "popular", pageSize: 200 }),
  ]);

  // Build a rating map for priority boosting
  const ratingMap = new Map<string, number>(
    allProducts.items.map((p: Product) => [p.slug, p.rating]),
  );

  const staticPaths = [
    "", "/products", "/about", "/blog", "/contact", "/experts", "/delivery",
    "/loyalty", "/ingredients", "/brands", "/news", "/payment", "/guarantee",
    "/requisites", "/licenses",
  ];
  const categoryPaths = categories.map((c) => `/products/${c.slug}`);
  const [blogSlugs, expertSlugs] = await Promise.all([listArticleSlugs(), listExpertSlugs()]);
  const productPaths = listAllSlugs().map(({ slug }) => `/product/${slug}`);
  const blogPaths = blogSlugs.map((slug) => `/blog/${slug}`);
  const expertPaths = expertSlugs.map((slug) => `/experts/${slug}`);
  const allPaths = [...staticPaths, ...categoryPaths, ...productPaths, ...blogPaths, ...expertPaths];

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
    }

    return {
      url: `${SITE_URL}/${routing.defaultLocale}${path}`,
      lastModified: new Date(),
      changeFrequency: path.startsWith("/product/") ? "weekly" : "monthly",
      priority,
      alternates: { languages },
    };
  });
}
