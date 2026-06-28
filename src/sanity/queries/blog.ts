import { groq } from "next-sanity";

export const allArticlesQuery = groq`*[_type == "blogPost"] | order(date desc) {
  "slug": slug.current,
  date,
  readingMinutes,
  mainImage,
  "category": category[$locale],
  "title": title[$locale],
  "excerpt": excerpt[$locale]
}`;

export const articleBySlugQuery = groq`*[_type == "blogPost" && slug.current == $slug][0] {
  "slug": slug.current,
  date,
  readingMinutes,
  mainImage,
  "category": category[$locale],
  "title": title[$locale],
  "excerpt": excerpt[$locale],
  "sections": sections[] {
    "heading": heading[$locale],
    body
  },
  relatedProductSlugs
}`;

export const allArticleSlugsQuery = groq`*[_type == "blogPost"] { "slug": slug.current }`;
