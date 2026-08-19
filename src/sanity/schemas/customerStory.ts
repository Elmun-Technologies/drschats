import { defineField, defineType } from "sanity";

const localeText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "text" },
      { name: "ru", title: "Русский", type: "text" },
    ],
  });

/*
  A customer story is the long form of social proof: a video, a case or a
  before/after, as opposed to the star rating that already lives on the
  product. Only publish stories from real, consenting customers — the page
  carries no fabricated content by design, which is why the repo ships no seed.
*/
export const customerStory = defineType({
  name: "customerStory",
  title: "Customer Story",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "author" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Video review", value: "video" },
          { title: "Case study", value: "case" },
          { title: "Transformation (before / after)", value: "transformation" },
        ],
        layout: "radio",
      },
      initialValue: "case",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "author", title: "Author", type: "string", validation: (r) => r.required() }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (rule) => rule.min(1).max(5),
    }),
    defineField({ name: "date", title: "Date", type: "date" }),
    localeText("quote", "Short quote (card)"),
    localeText("body", "Full story"),
    defineField({
      name: "videoUrl",
      title: "Video URL (YouTube)",
      type: "url",
      description: "Only used when kind = video",
    }),
    defineField({ name: "beforeImage", title: "Before image", type: "image" }),
    defineField({ name: "afterImage", title: "After image", type: "image" }),
    defineField({
      name: "productSlugs",
      title: "Product slugs",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "consent",
      title: "Publication consent on file",
      type: "boolean",
      description: "Only stories with recorded consent may be published",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "author", subtitle: "kind" },
    prepare: ({ title, subtitle }) => ({ title: title || "Unnamed", subtitle }),
  },
});
