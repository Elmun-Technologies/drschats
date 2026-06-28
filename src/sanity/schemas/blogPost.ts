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

const localeText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "text" },
      { name: "ru", title: "Русский", type: "text" },
      { name: "en", title: "English", type: "text" },
    ],
  });

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title.uz" } }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({ name: "readingMinutes", title: "Reading Minutes", type: "number" }),
    defineField({ name: "mainImage", title: "Main Image", type: "image", options: { hotspot: true } }),
    localeString("category", "Category"),
    localeString("title", "Title"),
    localeText("excerpt", "Excerpt"),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            localeString("heading", "Heading"),
            defineField({
              name: "body",
              title: "Body",
              type: "object",
              fields: [
                { name: "uz", title: "O'zbekcha", type: "array", of: [{ type: "block" }] },
                { name: "ru", title: "Русский", type: "array", of: [{ type: "block" }] },
                { name: "en", title: "English", type: "array", of: [{ type: "block" }] },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "relatedProductSlugs",
      title: "Related Product Slugs",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "title.uz", media: "mainImage" },
    prepare: ({ title, media }) => ({ title: title || "Untitled", media }),
  },
});
