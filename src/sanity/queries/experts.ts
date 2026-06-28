import { groq } from "next-sanity";

export const allExpertsQuery = groq`*[_type == "expert"] | order(_createdAt asc) {
  "id": expertId,
  "slug": slug.current,
  name,
  photo,
  worksFor,
  sameAs,
  "title": title[$locale],
  "bio": bio[$locale],
  "credentials": credentials[$locale]
}`;

export const expertBySlugQuery = groq`*[_type == "expert" && slug.current == $slug][0] {
  "id": expertId,
  "slug": slug.current,
  name,
  photo,
  worksFor,
  sameAs,
  "title": title[$locale],
  "bio": bio[$locale],
  "credentials": credentials[$locale]
}`;

export const allExpertSlugsQuery = groq`*[_type == "expert"] { "slug": slug.current }`;
