import { groq } from "next-sanity";

export const allBrandsQuery = groq`*[_type == "brand"] | order(_createdAt asc) {
  "slug": slug.current,
  name,
  logo,
  country,
  "description": description[$locale]
}`;
