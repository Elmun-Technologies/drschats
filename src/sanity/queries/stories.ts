import { groq } from "next-sanity";

/** Consent is enforced in the query, not only in the studio. */
export const allStoriesQuery = groq`*[_type == "customerStory" && consent == true && defined(slug.current)] | order(coalesce(date, _createdAt) desc) {
  "slug": slug.current,
  kind,
  author,
  city,
  rating,
  date,
  "quote": quote[$locale],
  "body": body[$locale],
  videoUrl,
  beforeImage,
  afterImage,
  "productSlugs": coalesce(productSlugs, [])
}`;
