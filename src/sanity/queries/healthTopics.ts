import { groq } from "next-sanity";

const topicProjection = `
  kind,
  "slug": slug.current,
  "name": name[$locale],
  "headline": headline[$locale],
  "intro": intro[$locale],
  "sections": coalesce(sections[$locale], []),
  "bullets": coalesce(bullets[$locale], []),
  "faq": coalesce(faq[$locale], []),
  "ingredientSlugs": coalesce(ingredientSlugs, []),
  "productSlugs": coalesce(productSlugs, []),
  "categorySlugs": coalesce(categorySlugs, []),
  "relatedSlugs": coalesce(relatedSlugs, [])
`;

export const allHealthTopicsQuery = groq`*[_type == "healthTopic" && defined(slug.current)] | order(_createdAt asc) {${topicProjection}}`;

export const healthTopicsByKindQuery = groq`*[_type == "healthTopic" && kind == $kind && defined(slug.current)] | order(_createdAt asc) {${topicProjection}}`;

export const healthTopicBySlugQuery = groq`*[_type == "healthTopic" && slug.current == $slug][0]{${topicProjection}}`;

export const healthTopicIndexQuery = groq`*[_type == "healthTopic" && defined(slug.current)]{
  kind,
  "slug": slug.current
}`;
