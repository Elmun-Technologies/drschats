import { defineField, defineType } from "sanity";

const localeString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "string" },
      { name: "ru", title: "Русский", type: "string" },
      { name: "en", title: "English", type: "string" },
    ],
  });

export const expert = defineType({
  name: "expert",
  title: "Expert",
  type: "document",
  fields: [
    defineField({ name: "expertId", title: "ID (unique key)", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "worksFor", title: "Works For (Organization URL)", type: "url" }),
    defineField({
      name: "sameAs",
      title: "Social / Profile Links",
      type: "array",
      of: [{ type: "url" }],
    }),
    localeString("title", "Title / Position"),
    defineField({
      name: "bio",
      title: "Bio",
      type: "object",
      fields: [
        { name: "uz", title: "O'zbekcha", type: "text" },
        { name: "ru", title: "Русский", type: "text" },
        { name: "en", title: "English", type: "text" },
      ],
    }),
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "object",
      fields: [
        { name: "uz", title: "O'zbekcha", type: "array", of: [{ type: "string" }] },
        { name: "ru", title: "Русский", type: "array", of: [{ type: "string" }] },
        { name: "en", title: "English", type: "array", of: [{ type: "string" }] },
      ],
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
    prepare: ({ title, media }) => ({ title: title || "Unnamed", media }),
  },
});
