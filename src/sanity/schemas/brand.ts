import { defineField, defineType } from "sanity";

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

export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "name", title: "Brand Name", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "country", title: "Country", type: "string" }),
    localeText("description", "Description"),
  ],
  preview: {
    select: { title: "name", media: "logo" },
    prepare: ({ title, media }) => ({ title: title || "Unnamed", media }),
  },
});
