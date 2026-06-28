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

export const ingredient = defineType({
  name: "ingredient",
  title: "Ingredient",
  type: "document",
  fields: [
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name.uz" } }),
    localeString("name", "Name"),
    localeString("role", "Role"),
    localeText("description", "Description"),
    defineField({
      name: "inProducts",
      title: "In Products (slugs)",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "name.uz" },
    prepare: ({ title }) => ({ title: title || "Unnamed" }),
  },
});
