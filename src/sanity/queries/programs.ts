import { groq } from "next-sanity";

const programProjection = `
  "slug": slug.current,
  "name": name[$locale],
  "headline": headline[$locale],
  "intro": intro[$locale],
  "durationDays": coalesce(durationDays, 30),
  "discountPercent": coalesce(discountPercent, 0),
  "forWhom": coalesce(forWhom[$locale], []),
  "steps": coalesce(steps[$locale], []),
  "faq": coalesce(faq[$locale], []),
  "productSlugs": coalesce(productSlugs, []),
  "categorySlugs": coalesce(categorySlugs, []),
  "ingredientSlugs": coalesce(ingredientSlugs, []),
  "topicSlugs": coalesce(topicSlugs, [])
`;

export const allProgramsQuery = groq`*[_type == "program" && defined(slug.current)] | order(_createdAt asc) {${programProjection}}`;

export const programBySlugQuery = groq`*[_type == "program" && slug.current == $slug][0]{${programProjection}}`;

export const programSlugsQuery = groq`*[_type == "program" && defined(slug.current)].slug.current`;
