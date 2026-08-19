import { groq } from "next-sanity";

export const allIngredientsQuery = groq`*[_type == "ingredient"] | order(_createdAt asc) {
  "slug": slug.current,
  "name": name[$locale],
  "role": role[$locale],
  "description": description[$locale],
  inProducts
}`;

export const allSynergyQuery = groq`*[_type == "synergyPair"] | order(_createdAt asc) {
  type,
  "a": a[$locale],
  "b": b[$locale],
  "note": note[$locale]
}`;
